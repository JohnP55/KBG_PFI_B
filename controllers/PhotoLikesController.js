import Authorizations from '../authorizations.js';
import Repository from '../models/repository.js';
import Controller from './Controller.js';
import * as utilities from "../utilities.js";
import TokenManager from '../tokensManager.js';
import PhotoLikeModel from '../models/photoLike.js';
import PhotoModel from '../models/photo.js';

export default
    class PhotoLikes extends Controller {
    constructor(HttpContext) {
        super(HttpContext, new Repository(new PhotoLikeModel()));
    }
    // Unconventional use of the API. /photoLikes/id toggles the like state on the photo `id` for the user in the bearer token.
    // This was done deliberately as to not send redundant data.
    get(photoId) {
        if (this.HttpContext.req.headers["authorization"] != undefined) {
            let token = this.HttpContext.req.headers["authorization"].replace('Bearer ', '');
            token = TokenManager.find(token);
            if (!token) return this.HttpContext.response.unAuthorized();
            let likeObj = {"AccountId": token.User.Id, "PhotoId": photoId};
            let likeEntry = this.repository.getAll(likeObj)[0];
            if (likeEntry) {
                this.repository.remove(likeEntry.Id);
            } else {
                this.repository.add(likeObj);
            }
            new Repository(new PhotoModel()).newETag();
            this.repository.newETag();
            return this.HttpContext.response.accepted();
        }
        return this.HttpContext.response.unAuthorized();
    }
}