import Model from './model.js';
import UserModel from './user.js';
import Repository from '../models/repository.js';

export default class PhotoLike extends Model {
    constructor() {
        super();
        this.addField('AccountId', 'string');
        this.addField('PhotoId', 'string');

        this.setKey("Id");
    }

    bindExtraData(instance) {
        instance = super.bindExtraData(instance);
        return instance;
    }
}