/*
Copyright (c) 2019, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
*
* WSO2 Inc. licenses this file to you under the Apache License,
* Version 2.0 (the "License"); you may not use this file except
* in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied. See the License for the
* specific language governing permissions and limitations
* under the License.
*/

import {workspace, Uri, window, commands, WorkspaceEdit, Task} from "vscode";
import * as path from 'path';
import * as fse from "fs-extra";
import {executeProjectBuildCommand} from "../mavenInternals/commandHandler";
import { ArtifactModule } from "../artifacts/ArtifactModule";
import { DataServiceModule } from "../dataService/DataServiceModule";
import {APIArtifactInfo, EndpointArtifactInfo, InboundEndpointArtifactInfo, LocalEntryArtifactInfo, MessageProcessorArtifactInfo, MessageStoreArtifactInfo, ProjectNatures, ProxyArtifactInfo, SequenceArtifactInfo, SubDirectories, TaskArtifactInfo, TemplateArtifactInfo} from "../artifacts/artifactUtils";
import {chooseTargetFolder, chooseTargetFile, showInputBox, showInputBoxForArtifactId, showInputBoxForGroupId} from "../utils/uiUtils";
import {Utils} from "../utils/Utils";
import { type } from "os";

let DOM = require('xmldom').DOMParser;
var fileSystem = require('fs');
var archiver = require('archiver');
const extract = require('extract-zip');
var AdmZip = require('adm-zip');

/*
* Build the project and create the .car file in the target folder
* */
export function createDeployableArchive() {

    let projectNatures: string[] = [SubDirectories.COMPOSITE_EXPORTER, SubDirectories.CONFIGS, SubDirectories.CONNECTOR_EXPORTER,
         SubDirectories.REGISTRY_RESOURCES, SubDirectories.DATA_SERVICE];
    

    if (workspace.workspaceFolders) {
        let rootDirectory: string = workspace.workspaceFolders[0].uri.fsPath;
        fileSystem.readdir(rootDirectory, (err: any, files: any) => {
            if (err)
              console.log(err);
            else {
              files.forEach( (file: any) => {
                let projConfigFilePath: string = path.join(rootDirectory, file, ".project");
                let pomFilePath: string = path.join(rootDirectory, file, "pom.xml");
                ArtifactModule.checkPathExistence(pomFilePath).then(exists => {
                    if (exists) {
                        let projectNature: string = ArtifactModule.getProjectNature(projConfigFilePath);
                        if(projectNatures.indexOf(projectNature) !== -1){
                            ArtifactModule.checkBuildPlugins(pomFilePath, projectNature);
                        }
                    }
                });

              })
            }
            executeProjectBuildCommand(rootDirectory);
          });
        }
}

export async function createZipArchive(){

    // Set home dir as the target folder hint.
    const homedir: string = require('os').homedir();
    const targetFolderHint = Uri.file(homedir);

    let zipFileName = await showInputBox("Enter zip archive name");

    if((typeof zipFileName === "undefined") || (zipFileName === "") ) {
        zipFileName = "untitled";
    }

    //get the destination folder
    const targetLocation: string | null = await chooseTargetFolder(targetFolderHint);

    if(workspace.workspaceFolders && targetLocation){

        let rootDirectory: string = workspace.workspaceFolders[0].uri.fsPath;
        let projectName: string = workspace.workspaceFolders[0].name;

        let zipFilePath: string = path.join(targetLocation, zipFileName+".zip");
        let output = fileSystem.createWriteStream(zipFilePath);
        let archive = archiver('zip');

        archive.on('error', function(err: any){
            window.showErrorMessage("Zip Archive Creation Failed");
            return;
            
        });

        // pipe archive data to the file
        archive.pipe(output);

        // append files from a sub-directory and naming it <project-name> within the archive
        archive.directory(rootDirectory, projectName);
        
        // finalize the archive (ie we are done appending files but streams have to finish yet)
        archive.finalize();
        window.showInformationMessage("Zip Archive Created Successfully");
            

    }
}

export async function unzipArchive(){

    try {
        // Set home dir as the target folder hint.
        const homedir: string = require('os').homedir();
        const targetFolderHint = Uri.file(homedir);

        //get the target folder
        const targetLocation: string | null = await chooseTargetFile(targetFolderHint, "Select ZIP Archive...", {'ZIP files': ['zip']});

        var zip = new AdmZip(targetLocation);
        var zipEntries = zip.getEntries(); // an array of ZipEntry records
        
        if(targetLocation){

            //get the destination directory
            const destinationLocation: string | null = await chooseTargetFolder(targetFolderHint);

            if(destinationLocation){
                await extract(targetLocation, { dir: destinationLocation })

                window.showInformationMessage("Zip Archive Imported Successfully");
    
                let projectName: string = zipEntries[0].entryName.split(path.sep)[0].trim();
                let projectFilePath: string = path.join(destinationLocation, projectName);
                commands.executeCommand('vscode.openFolder', Uri.file(projectFilePath), true);

            }
           
        }
        
      } catch (err) {
            window.showErrorMessage("Zip Archive Extraction Failed");
      }
}

export async function createProjectFromCar(){

    const dirName = __dirname;

    try {
        // Set home dir as the target folder hint.
        const homedir: string = require('os').homedir();
        const targetFolderHint = Uri.file(homedir);

        //get the target folder
        const targetLocation: string | null = await chooseTargetFile(targetFolderHint, "Select CAR Archive...", {'car files': ['car']});
        
        if(targetLocation){

            let pathSplit: string[] = targetLocation.split(".car")
            let newFilePath: string = pathSplit[0] + ".zip";

            fileSystem.renameSync(targetLocation, newFilePath);

            var zip = new AdmZip(newFilePath);
            var zipEntries = zip.getEntries(); // an array of ZipEntry records
            zipEntries.forEach( (entry: any) => {
                console.log(entry.entryName);
            });

            let artifactID: string | undefined = await showInputBoxForArtifactId();
            let groupID: string | undefined = await showInputBoxForGroupId();

            // Ensure that artifactID name is valid.
            while (typeof artifactID !== "undefined" && !Utils.validate(artifactID)) {
                window.showErrorMessage("Enter valid ArtifactId name!!");
                artifactID = await showInputBoxForArtifactId();
            }

            // Ensure that groupID name is valid.
            while (typeof groupID !== "undefined" && !Utils.validate(groupID)) {
                window.showErrorMessage("Enter valid GroupId name!!");
                groupID = await showInputBoxForGroupId();
            }

            if (typeof artifactID === "undefined" || typeof groupID === "undefined") {
                return;
            }

            //get the destination directory
            const destinationLocation: string | null = await chooseTargetFolder(targetFolderHint);

            if(destinationLocation){

                //create new project directory
                let newProjectDirectory: string = path.join(destinationLocation, artifactID);
                fileSystem.mkdirSync(newProjectDirectory);

                //extract zip archive
                let tmpDirectory: string = path.join(newProjectDirectory, "tmp");
                fse.mkdirSync(tmpDirectory);
                await extract(newFilePath, { dir: tmpDirectory });

                //read root metadata file
                let rootMetaDataPath: string = path.join(tmpDirectory, "artifacts.xml");
                if(!fse.existsSync(rootMetaDataPath)){
                    window.showErrorMessage("Can not find root artifacts file.New project creation failed...!");
                    return;
                }
                const buffer: Buffer = fse.readFileSync(rootMetaDataPath);
                let medatadaXml = new DOM().parseFromString(buffer.toString(), "text/xml");
                let artifacts = medatadaXml.getElementsByTagName("artifact");
                if(artifacts.length > 0){
                    let name: string = artifacts[0].getAttribute("name");
                    let version: string = artifacts[0].getAttribute("version");
                    let dependencies = artifacts[0].getElementsByTagName("dependency");
                    createRootPomXml(destinationLocation, groupID, artifactID, version);
                    //create settings.json
                    let settingsDirectory: string = path.join(newProjectDirectory,".vscode");
                    let settingsFilePath: string = path.join(settingsDirectory, "settings.json");
                    let templateSettingsFilePath: string = path.join(dirName, "..", "..", "templates", "Conf", "settings.json");
                    fse.mkdirSync(settingsDirectory);

                    let edit = new WorkspaceEdit();
                    edit.createFile(Uri.file(settingsFilePath));
                    workspace.applyEdit(edit);
                    let settings: Buffer = fse.readFileSync(templateSettingsFilePath);
                    fse.writeFileSync(settingsFilePath, settings);
                    
                    //create composite exporter
                    ArtifactModule.CreateNewCompositeExporterProject(name.trim(), newProjectDirectory);
                    //create configs
                    let esbConfigsName: string = `${artifactID}Configs`;
                    ArtifactModule.CreateNewESBConfigProject(esbConfigsName, newProjectDirectory);

                    if(dependencies.length === 0){
                        window.showInformationMessage("No dependencies for the project...!");
                        return;
                    }

                    for(let i=0; i<dependencies.length; i++){
                        let artifactName: string = dependencies[i].getAttribute("artifact");
                        let version: string = dependencies[i].getAttribute("version");
                        let include: boolean = dependencies[i].getAttribute("include");
                        if(include){
                            let artifactXmlFilePath: string = path.join(tmpDirectory, `${artifactName}_${version}`, "artifact.xml");
                            if(fse.existsSync(artifactXmlFilePath)){
                                //create synapse artifacts
                                let ESBConfigseDirctory: string = path.join(newProjectDirectory, esbConfigsName);
                                copySynapseArtifact(ESBConfigseDirctory, artifactXmlFilePath);

                            }
                        }
                    }
                    
                    commands.executeCommand('vscode.openFolder', Uri.file(newProjectDirectory), true);
                }

                

                //window.showInformationMessage("Zip Archive Imported Successfully");
    
                //let projectName: string = zipEntries[0].entryName.split(path.sep)[0].trim();
                //let projectFilePath: string = path.join(destinationLocation, projectName);
                //commands.executeCommand('vscode.openFolder', Uri.file(projectFilePath), true);

            }
           
        }
        
      } catch (err) {
            window.showErrorMessage("Project Creation Failed");
      }

}

function createRootPomXml(directory: string,groupID: string, artifactID: string, version: string){
    let templatePomFilePath: string = path.join(__dirname, "..", "..", "templates", "pom", "rootPom.xml");
    let pomFilePath: string = path.join(directory, artifactID, "pom.xml");
    const rootPomBuffer: Buffer = fse.readFileSync(templatePomFilePath);
    let rootPomXmlDoc = new DOM().parseFromString(rootPomBuffer.toString(), "text/xml");
    let rootGroupId = rootPomXmlDoc.getElementsByTagName("groupId")[0];
    let rootArtifactId = rootPomXmlDoc.getElementsByTagName("artifactId")[0];
    let rootVersion = rootPomXmlDoc.getElementsByTagName("version")[0];
    let name = rootPomXmlDoc.getElementsByTagName("name")[0];
    let description = rootPomXmlDoc.getElementsByTagName("description")[0];
    rootGroupId.textContent = groupID;
    rootArtifactId.textContent = artifactID;
    rootVersion.textContent = version;
    name.textContent = artifactID;
    description.textContent = artifactID;
    DataServiceModule.createFile(pomFilePath, rootPomXmlDoc);
}

function copySynapseArtifact(ConfigsDirecrory: string, artifactXmlFilePath: string){

    console.log("copying files");

    const buffer: Buffer = fse.readFileSync(artifactXmlFilePath);
    let xmlDoc = new DOM().parseFromString(buffer.toString(), "text/xml");
    let artifact = xmlDoc.getElementsByTagName("artifact");
    if(artifact.length > 0){
        console.log("h1");
        
        let type: string = artifact[0].getAttribute("type").trim();
    
        let artifactTypes: string[] = [APIArtifactInfo.TYPE, ProxyArtifactInfo.TYPE, EndpointArtifactInfo.TYPE, InboundEndpointArtifactInfo.TYPE,
            LocalEntryArtifactInfo.TYPE, MessageStoreArtifactInfo.TYPE, MessageProcessorArtifactInfo.TYPE, TemplateArtifactInfo.TYPE, 
            SequenceArtifactInfo.TYPE, TaskArtifactInfo.TYPE];
    
        let index: number = artifactTypes.indexOf(type);
        if(index === -1) return;//not a synapse artifact
        console.log("h2");

        let name: string = artifact[0].getAttribute("name").trim();
        let version: string = artifact[0].getAttribute("version").trim();
        let serverRole: string = artifact[0].getAttribute("serverRole").trim();
        let fileName: string = artifact[0].getElementsByTagName("file")[0].textContent.trim();
        let newFileName: string = `${name}.xml`;

        let artifcatFolders: string[] = [APIArtifactInfo.DESTINATION_FOLDER, ProxyArtifactInfo.PROXY_DESTINATION_FOLDER, EndpointArtifactInfo.DESTINATION_FOLDER,
        InboundEndpointArtifactInfo.DESTINATION_FOLDER, LocalEntryArtifactInfo.DESTINATION_FOLDER, MessageStoreArtifactInfo.DESTINATION_FOLDER,
        MessageProcessorArtifactInfo.DESTINATION_FOLDER, TemplateArtifactInfo.DESTINATION_FOLDER, SequenceArtifactInfo.DESTINATION_FOLDER,
        TaskArtifactInfo.DESTINATION_FOLDER];

        let destinationFolder: string = artifcatFolders[index];
        let destinationFilePath: string = path.join(ConfigsDirecrory, "src", "main", "synapse-config", destinationFolder, newFileName);
        console.log(destinationFilePath);
        
        let curruntArtifactPath: string = path.join(artifactXmlFilePath, "..", fileName);
        console.log(curruntArtifactPath);
        
        console.log("h3");

        let edit = new WorkspaceEdit();
        edit.createFile(Uri.file(destinationFilePath));
        workspace.applyEdit(edit);

        fse.copySync(curruntArtifactPath, destinationFilePath);
        
        console.log("h4");

        //update artifact.xml
    
        
    }

    

}
