import * as path from "path";

import { walkFilesSync } from "../../testUtil/walkSync";
import { updateSurroundingPairTest } from "./transformations/updateSurroundingPairTest";
import { FixtureTransformation } from "./types";
import { upgrade } from "./transformations/upgrade";
import { identity } from "./transformations/identity";
import { transformFile } from "./transformFile";

const AVAILABLE_TRANSFORMATIONS: Record<string, FixtureTransformation> = {
  upgrade,
  autoFormat: identity,
  custom: updateSurroundingPairTest,
};

async function main(transformationName: string | undefined) {
  const transformation =
    transformationName == null
      ? identity
      : AVAILABLE_TRANSFORMATIONS[transformationName];

  if (transformation == null) {
    throw new Error(`Unknown transformation ${transformationName}`);
  }

  const directory = path.join(
    __dirname,
    "../../../src/test/suite/fixtures/recorded"
  );
  const files = walkFilesSync(directory);

  files.forEach((file) => transformFile(transformation, file));
}

main(process.argv[2]);