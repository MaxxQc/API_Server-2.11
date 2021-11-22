module.exports = 
class New
{
    constructor(userId, title, imageGUID, content)
    {
        this.Id = 0;
        this.Title = title !== undefined ? title : "";
        this.ImageGUID = imageGUID !== undefined ? imageGUID : "";
        this.Content = content !== undefined ? content : "";
        this.UserId = userId !== undefined ? userId : 0;
        this.CreationDate = new Date();
    }

    static valid(instance) {
        const Validator = new require('./validator');
        let validator = new Validator();
        validator.addField('Id','integer');
        validator.addField('Title','string');
        validator.addField('CreationDate', 'datetime');
        validator.addField('UserId', 'integer');
        validator.addField('Content','string');
        return validator.test(instance);
    }
}