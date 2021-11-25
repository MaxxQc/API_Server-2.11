const Repository = require('./repository');
const ImageFilesRepository = require('./imageFilesRepository.js');
const New = require('./new.js');
const utilities = require("../utilities");
module.exports =
    class NewsRepository extends Repository {
        constructor(req) {
            super('News', true);
            this.users = new Repository('Users');
            this.req = req;
            this.setBindExtraDataMethod(this.bindUsernameAndNewURL);
        }

        bindUsernameAndNewURL(userNew) {
            if (userNew) {
                let user = this.users.get(userNew.UserId);
                let username = "unknown";
                let authorImage = "";
                if (user !== null)
                {
                    username = user.Name;
                    authorImage = "http://" + this.req.headers["host"] + ImageFilesRepository.getImageFileURL(user["AvatarGUID"]);
                }
                let bindedImage = { ...userNew };
                bindedImage["Username"] = username;
                bindedImage["AvatarURL"] = authorImage;
                bindedImage["Date"] = utilities.secondsToDateString(userNew["CreationDate"]);
                if (userNew["GUID"] != "") {
                    bindedImage["OriginalURL"] = "http://" + this.req.headers["host"] + ImageFilesRepository.getImageFileURL(userNew["GUID"]);
                    bindedImage["ThumbnailURL"] = "http://" + this.req.headers["host"] + ImageFilesRepository.getThumbnailFileURL(userNew["GUID"]);
                } else {
                    bindedImage["OriginalURL"] = "";
                    bindedImage["ThumbnailURL"] = "";
                }
                return bindedImage;
            }
            
            return null;
        }
        add(userNew) {
            userNew["CreationDate"] = utilities.nowInSeconds();
            if (New.valid(userNew)) {
                userNew["GUID"] = ImageFilesRepository.storeImageData("", userNew["ImageData"]);
                delete userNew["ImageData"];
                return super.add(userNew);
            }
            return null;
        }
        update(userNew) {
            userNew["CreationDate"] = utilities.nowInSeconds();
            if (New.valid(userNew)) {
                let foundImage = super.get(userNew.Id);
                if (foundImage != null) {
                    userNew["GUID"] = ImageFilesRepository.storeImageData(userNew["GUID"], userNew["ImageData"]);
                    delete userNew["ImageData"];
                    return super.update(userNew);
                }
            }
            return false;
        }
        remove(id) {
            let foundImage = super.get(id);
            if (foundImage) {
                ImageFilesRepository.removeImageFile(foundImage["GUID"]);
                return super.remove(id);
            }
            return false;
        }
    }