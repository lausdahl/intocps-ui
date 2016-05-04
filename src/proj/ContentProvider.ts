

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
                        var filePath: string = path.join(root.filepath, name);
                        var stat = fs.statSync(filePath);
                        if (stat.isFile()) {
                            if (filePath.indexOf('.coe.json') >= 0)
                                children.push(new Container(name, filePath, ContainerType.CoeConfig));
                            if (filePath.indexOf('.mm.json') >= 0)
                                children.push(new Container(name, filePath, ContainerType.MultiModelConfig));
                            if (filePath.indexOf('.fmu') >= 0)
                                children.push(new Container(name, filePath, ContainerType.FMU));
                                 if (filePath.indexOf('.sysml.json') >= 0)
                                children.push(new Container(name, filePath, ContainerType.SysMLExport));

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