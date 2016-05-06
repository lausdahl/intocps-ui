

import {Container} from "./Container"
import {ContainerType} from "./Container"

export class ContentProvider {

    getChildren(root: Container): Container[] {

        var children: Container[] = [];

        switch (root.type) {
            case ContainerType.Folder:
                {
                    var fs = require('fs'),
                        path = require('path');
                    fs.readdirSync(root.filepath).forEach(function (name: string) {

                        if (name.indexOf('.') == 0)
                            return;

                        var filePath: string = path.join(root.filepath, name);
                        var stat = fs.statSync(filePath);
                        if (stat.isFile()) {
                            if (filePath.indexOf('.coe.json') >= 0) {
                                children.push(new Container(name, filePath, ContainerType.CoeConfig));
                            }
                            else if (filePath.indexOf('.mm.json') >= 0) {
                                children.push(new Container(name, filePath, ContainerType.MultiModelConfig));
                            }
                            else if (filePath.indexOf('.fmu') >= 0) {
                                children.push(new Container(name, filePath, ContainerType.FMU));
                            }
                            else if (filePath.indexOf('.sysml.json') >= 0) {
                                children.push(new Container(name, filePath, ContainerType.SysMLExport));
                            }
                            else if (filePath.indexOf('.emx') >= 0) {
                                children.push(new Container(name, filePath, ContainerType.EMX));
                            }
                            else if (filePath.indexOf('.mo') >= 0) {
                                children.push(new Container(name, filePath, ContainerType.MO));
                            } else if (filePath.indexOf('.csv') >= 0) {
                                children.push(new Container(name, filePath, ContainerType.CSV));
                            }

                        } else if (stat.isDirectory()) {
                            children.push(new Container(name, filePath, ContainerType.Folder));

                        }
                    });
                    break;
                }

        }


        return children;
    }
}