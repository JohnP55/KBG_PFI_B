import Authorizations from '../authorizations.js';
import Repository from '../models/repository.js';
import PhotoModel from '../models/photo.js';
import PhotoLikeModel from '../models/photoLike.js';
import Controller from './Controller.js';
import * as utilities from "../utilities.js";
import TokenManager from '../tokensManager.js';

export default
    class Photos extends Controller {
    constructor(HttpContext) {
        super(HttpContext, new Repository(new PhotoModel()), Authorizations.user());
        this.photoLikesRepository = new Repository(new PhotoLikeModel());
    }
    setExtraData(data) {
        if (this.HttpContext.req.headers["authorization"] != undefined) {
            let token = this.HttpContext.req.headers["authorization"].replace('Bearer ', '');
            token = TokenManager.find(token);
            if (!token) return this.HttpContext.response.unAuthorized();
            if (data.Id != 0) {
                if (this.repository.get(data.Id).OwnerId != token.User.Id) {
                    return this.HttpContext.response.unAuthorized();
                }
            }
            data.OwnerId = token.User.Id;
            data.Date = utilities.nowInSeconds();
        }
    }
    post(data) {
        this.setExtraData(data);
        super.post(data);
    }
    put(data) {
        this.setExtraData(data);
        super.put(data);
    }
}