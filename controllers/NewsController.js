const NewsRepository = require('../models/newsRepository');
module.exports =
    class NewsController extends require('./Controller') {
        constructor(req, res, params) {
            super(req, res, params, false /* needAuthorization */);
            this.newsRepository = new NewsRepository(req);
        }

        head() {
            this.response.JSON(null, this.newsRepository.ETag);
        }
        
        get(id) {
            // if we have no parameter, expose the list of possible query strings
            if (this.params === null) {
                if (!isNaN(id)) {
                    this.response.JSON(this.newsRepository.get(id));
                }
                else
                    this.response.JSON(this.newsRepository.getAll(),
                        this.newsRepository.ETag);
            }
            else {
                if (Object.keys(this.params).length === 0) /* ? only */ {
                    this.queryStringHelp();
                } else {
                    this.response.JSON(this.newsRepository.getAll(this.params), this.newsRepository.ETag);
                }
            }
        }

        post(userNew) {
            if (this.requestActionAuthorized()) {
                let newUserNew = this.newsRepository.add(userNew);
                if (newUserNew)
                    this.response.created(newUserNew);
                else
                    this.response.unprocessable();
            } else
                this.response.unAuthorized();
        }

        put(userNew) {
            if (this.requestActionAuthorized()) {
                if (this.newsRepository.update(userNew))
                    this.response.ok();
                else
                    this.response.unprocessable();
            } else
                this.response.unAuthorized();
        }

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