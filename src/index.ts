import sharp from "sharp";
import chalk from "chalk";
import { glob } from "glob";
import { existsSync, lstatSync, mkdirSync, rmdirSync } from "fs";
import { basename, dirname, extname } from "path";

interface Params {
  source: string;
  target: string;

  inputFormats: string[];
  outputFormats: string[];

  widths: number[];
  enlarge: boolean;

  clear: boolean;

  verbose: boolean;
  debug: boolean;
}

const run = (params: Params): true | void => {
  const validateParams = (): string | true => {
    if (!params.source) {
      return "Source folder is required";
    }

    if (!params.target) {
      return "Target folder is required";
    }

    if (!params.inputFormats) {
      return "Input formats are required";
    }

    if (!params.outputFormats) {
      return "Output formats are required";
    }

    if (!(params.inputFormats instanceof Array)) {
      params.inputFormats = [params.inputFormats];
    }

    if (!(params.outputFormats instanceof Array)) {
      params.outputFormats = [params.outputFormats];
    }

    if (!(params.widths instanceof Array)) {
      params.widths = [params.widths];
    }

    if (params.verbose)
      console.log(chalk.cyan.bold("[INFOS]"), "All settings passed validation");

    if (params.debug)
      console.log(chalk.yellow.bold("[DEBUG]"), "Params: ", params);

    return true;
  };

  const checkOutputFolder = (
    directory: string,
    deleteIfExists: boolean = false
  ) => {
    if (existsSync(directory) && deleteIfExists) {
      if (params.verbose)
        console.log(
          chalk.cyan.bold("[INFOS]"),
          "Deleting target folder: ",
          directory
        );
      rmdirSync(directory, { recursive: true });
    }

    mkdirSync(directory, { recursive: true });
  };

  const optimizeAllImages = () => {
    glob(params.source + "/**/*")
      .then((files) => {
        if (params.verbose)
          console.log(
            chalk.cyan.bold("[INFOS]"),
            "Found",
            chalk.cyan.bold(files.length),
            "images, optimizing..."
          );

        files.forEach((file) => {
          if (
            !lstatSync(file).isDirectory() &&
            params.inputFormats.includes(extname(file).split(".")[1])
          ) {
            params.outputFormats.forEach((format) => {
              if (params.widths && params.widths.length > 0) {
                params.widths.forEach((width) => {
                  optimizeImage(file, format, width);
                });
              } else {
                optimizeImage(file, format);
              }
            });
          }
        });
      })
      .catch((err) => {
        throw new Error(err);
      });
  };

  const optimizeImage = (
    imagePath: string,
    newFormat: string,
    width?: number
  ) => {
    if (params.debug)
      console.log(
        chalk.yellow.bold("[DEBUG]"),
        "Optimizing image:",
        imagePath,
        chalk.yellow.bold("->", newFormat),
        width ?? ""
      );

    const fileName = basename(imagePath).split(".")[0];
    const fileExt = basename(imagePath).split(".")[1];
    const fileRelativePath = imagePath.replace(params.source, "");

    if (fileExt === newFormat && !width) {
      if (params.verbose)
        console.log(
          chalk.cyan.bold("[INFOS]"),
          "Skipping image",
          imagePath,
          "(correct format & size)"
        );
      return;
    }

    checkOutputFolder(
      dirname(`${params.target}${dirname(fileRelativePath)}/${fileName}`)
    );

    sharp(imagePath)
      .resize(width ?? null, null, { withoutEnlargement: !params.enlarge })
      .toFile(mountName(), (err) => {
        if (err) {
          throw err;
        }
      });

    function mountName() {
      let res = `${params.target}${dirname(fileRelativePath)}/${fileName}`;
      if (width) {
        res += `-${width}w`;
      }
      res += `.${newFormat}`;

      return res;
    }
  };

  const validation = validateParams();
  if (validation == true) {
    checkOutputFolder(params.target, params.clear);
    optimizeAllImages();
    return true;
  } else {
    throw new Error(validation);
  }
};

export default run;