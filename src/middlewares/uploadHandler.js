import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";

const uploadHandler = ({
  customPath = "general",
  isSingle = true,
  uploadType = "image",
} = {}) => {
  const filePath = path.resolve(`uploads/${customPath}`);
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(`${filePath}`, { recursive: true });
  }
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, `${filePath}/`);
    },
    filename: (req, file, cb) => {
      const fileName = uuidv4() + "-" + file.originalname;
      cb(null, fileName);
      file.finalDest = `uploads/${customPath}/${fileName}`;
    },
  });

  const fileFilter = (req, file, cb) => {
    // TODO:: is it a good approach to check file type by contains method instead of startsWith()?
    if (!file.mimetype.includes(uploadType)) {
      cb(new Error("file type not supported"), false);
    } else {
      cb(null, true);
    }
  };
  const upload = multer({
    storage,
    fileFilter,
  });
  if (isSingle) {
    return upload.single(uploadType);
  }
  return upload.array(uploadType, 4);
};
export default uploadHandler;
