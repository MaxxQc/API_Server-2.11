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
        this.setBindExtraDataMethod(this.bindUsernameAndImageURL);
    }
	
    bindUsernameAndImageURL(userNew) {
        if (userNew) {
            let user = this.users.get(userNew.UserId);
            let username = "unknown";
			let authorImage = "";
            if (user !== null)
			{
                username = user.Name;
				authorImage = "http://" + this.req.headers["host"] + ImageFilesRepository.getImageFileURL(user["AvatarGUID"]);
			}
            let bindedNew = {...userNew};
            bindedNew["Username"] = username;
			bindedNew["AvatarURL"] = authorImage;
            bindedNew["Date"] = utilities.secondsToDateString(userNew["Created"]);
            if (userNew["GUID"] != ""){
                bindedNew["OriginalURL"] = "http://" + this.req.headers["host"] + ImageFilesRepository.getImageFileURL(userNew["GUID"]);
                bindedNew["ThumbnailURL"] = "http://" + this.req.headers["host"] + ImageFilesRepository.getThumbnailFileURL(userNew["GUID"]);
            } else {
                bindedNew["OriginalURL"] = "";
                bindedNew["ThumbnailURL"] = "";
            }
            return bindedNew;
        }
        return null;
    }
	
    add(userNew) {
        userNew["Created"] = utilities.nowInSeconds();

        if (New.valid(userNew)) {
            userNew["GUID"] = ImageFilesRepository.storeImageData("", userNew["ImageData"]);
            delete userNew["ImageData"];
            return super.add(userNew);
        }

        return null;
    }
	
    update(userNew) {
        //userNew["Created"] = utilities.nowInSeconds();
        if (New.valid(userNew)) {
            let foundUserNew = super.get(userNew.Id);

            if (foundUserNew != null) {
                userNew["GUID"] = ImageFilesRepository.storeImageData(userNew["GUID"], userNew["ImageData"]);
                delete userNew["ImageData"];
                delete userNew["Username"];
                delete userNew["AvatarURL"];
                delete userNew["Date"];
                delete userNew["OriginalURL"];
                delete userNew["ThumbnailURL"];
                return super.update(userNew);
            }
        }

        return false;
    }
	
    remove(id) {
        let foundUserNew = super.get(id);

        if (foundUserNew) {
            ImageFilesRepository.removeImageFile(foundUserNew["GUID"]);
            return super.remove(id);
        }

        return false;
    }
}