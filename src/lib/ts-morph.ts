import { ts, Project, WriterFunction } from "ts-morph";

export function updateObjectProperty(
  sourceFilePath: string,
  objectName: string,
  propertyName: string,
  value: string | WriterFunction
) {
  const project = new Project();
  const sourceFile = project.addSourceFileAtPath(sourceFilePath);

  const object = sourceFile
    .getVariableDeclarationOrThrow(objectName)
    .getInitializerIfKindOrThrow(ts.SyntaxKind.ObjectLiteralExpression);

  const property = object.getPropertyOrThrow(propertyName);
  const index = object.getProperties().findIndex((p) => p === property);
  property.remove();
  
  object.insertPropertyAssignment(index, {
    name: propertyName,
    initializer: value,
  });

  sourceFile.formatText({ indentSize: 2 });
  sourceFile.saveSync();
}
