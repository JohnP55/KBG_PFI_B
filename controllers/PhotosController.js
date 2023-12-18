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
    getUser() {
        if (this.HttpContext.req.headers["authorization"] != undefined) {
            let token = this.HttpContext.req.headers["authorization"].replace('Bearer ', '');
            token = TokenManager.find(token);
            return token.User;
        }
    }
    setExtraData(data) {
        let user = this.getUser();
        if (!user) return this.HttpContext.response.unAuthorized();

        if (data.Id != 0) {
            let entry = this.repository.get(data.Id);
            if (entry.OwnerId != user.Id && !user.isAdmin) {
                return this.HttpContext.response.unAuthorized();
            }
            data.OwnerId = entry.OwnerId;
            data.Date = entry.Date;
        } else {
            data.OwnerId = user.Id;
            data.Date = utilities.nowInSeconds();
        }
        return false;
    }
    post(data) {
        this.setExtraData(data);
        super.post(data);
    }
    put(data) {
        let res = this.setExtraData(data);
        if (res) return res;
        super.put(data);
    }
    remove(id) {
        this.photoLikesRepository.getAll({PhotoId:id}).forEach((e) => {
            this.photoLikesRepository.remove(e.Id);
        });
        super.remove(id);
    }
}