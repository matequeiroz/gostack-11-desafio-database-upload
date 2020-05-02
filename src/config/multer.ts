import { diskStorage } from 'multer';
import { resolve, extname } from 'path';
import crypto from 'crypto';

export default {
  storage: diskStorage({
    destination: resolve(__dirname, '..', '..', 'tmp'),
    filename: (request, file, callback) => {
      const nameFileHash = crypto.randomBytes(8).toString('HEX');
      const nameFile = `${nameFileHash}-${Date.now()}${extname(
        file.originalname,
      )}`;

      return callback(null, nameFile);
    },
  }),
};
