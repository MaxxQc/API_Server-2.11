const Repository = require('../models/repository');
const New = require('../models/new');

module.exports =
    class NewsController extends require('./Controller') {
        constructor(req, res, params) {
            super(req, res, params, false /* needAuthorization */);
            this.newsRepository = new Repository('News', true /* cached */);
            this.newsRepository.setBindExtraDataMethod(this.resolveUserName);
        }
        
        resolveUserName(userNew) {
            let users = new Repository('Users');
            let user = users.get(userNew.UserId);
            let username = "unknown";
            if (user !== null)
                username = user.Name;
            let newWithUsername = { ...userNew };
            newWithUsername["Username"] = username;
            return newWithUsername;
        }

        head() {
            console.log("News ETag request:", this.newsRepository.ETag);
            this.response.ETag(this.newsRepository.ETag);
        }

        // GET: api/news
        // GET: api/news?sort=key&key=value....
        // GET: api/news/{id}
        get(id) {
            if (this.params) {
                if (Object.keys(this.params).length > 0) {
                    this.response.JSON(this.newsRepository.getAll(this.params), this.newsRepository.ETag);
                } else {
                    this.queryStringHelp();
                }
            }
            else {
                if (!isNaN(id)) {
                    this.response.JSON(this.newsRepository.get(id));
                }
                else {
                    this.response.JSON(this.newsRepository.getAll(), this.newsRepository.ETag);
                }
            }
        }
        post(userNew) {
            if (this.requestActionAuthorized()) {
                // validate user new before insertion
                if (New.valid(userNew)) {
                    // avoid duplicate names
                    if (this.newsRepository.findByField('Title', userNew.Title) !== null) {
                        this.response.conflict();
                    } else {
                        let newUserNew = this.newsRepository.add(userNew);
                        if (newUserNew)
                            this.response.created(newUserNew);
                        else
                            this.response.internalError();
                    }
                } else
                    this.response.unprocessable();
            } else
                this.response.unAuthorized();
        }
        // PUT: api/news body payload[{"Id":..., "Name": "...", "Url": "...", "Category": "...", "UserId": ..}]
        put(userNew) {
            if (this.requestActionAuthorized()) {
                // validate user new before updating
                if (New.valid(userNew)) {
                    let foundNew = this.newsRepository.findByField('Title', userNew.Name);
                    if (foundNew != null) {
                        if (foundNew.Id != userNew.Id) {
                            this.response.conflict();
                            return;
                        }
                    }
                    if (this.newsRepository.update(userNew))
                        this.response.ok();
                    else
                        this.response.notFound();
                } else
                    this.response.unprocessable();
            } else
                this.response.unAuthorized();
        }
        // DELETE: api/news/{id}
        remove(id) {
            if (this.requestActionAuthorized()) {
                if (this.newsRepository.remove(id))
                    this.response.accepted();
                else
                    this.response.notFound();
            } else
                this.response.unAuthorized();
        }
    }