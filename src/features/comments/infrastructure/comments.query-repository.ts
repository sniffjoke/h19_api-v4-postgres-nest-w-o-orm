import { Injectable, NotFoundException } from '@nestjs/common';
import {CommentViewModel} from "../api/models/output/comment.view.model";
import { PaginationBaseModel } from '../../../core/base/pagination.base.model';


@Injectable()
export class CommentsQueryRepository {
    constructor(
    ) {
    }

    async getAllCommentsByPostId(postId: string) {
        // const comments = await this.commentModel.find({postId})
        // return comments.map(comment => this.commentOutputMap(comment as unknown as HydratedDocument<CommentViewModel>))
    }

    async getAllCommentByPostIdWithQuery(query: any, postId: string) {
        // const generateQuery = await this.generateQuery(query, postId)
        // const post = await this.postModel.findById(postId)
        // if (!post) {
        //     throw new NotFoundException("Post not found")
        // }
        // const items = await this.commentModel
        //   .find({postId})
        //   .sort({[generateQuery.sortBy]: generateQuery.sortDirection})
        //   .limit(generateQuery.pageSize)
        //   .skip((generateQuery.page - 1) * generateQuery.pageSize)
        // const itemsOutput = items.map(item => this.commentOutputMap(item as unknown as HydratedDocument<CommentViewModel>))
        // const resultPosts = new PaginationBaseModel<CommentViewModel>(generateQuery, itemsOutput)
        // return resultPosts
    }

    private async generateQuery(query: any, postId: string) {
        // const totalCount = await this.commentModel.countDocuments({postId})
        // const pageSize = query.pageSize ? +query.pageSize : 10
        // const pagesCount = Math.ceil(totalCount / pageSize)
        // return {
        //     totalCount,
        //     pageSize,
        //     pagesCount,
        //     page: query.pageNumber ? Number(query.pageNumber) : 1,
        //     sortBy: query.sortBy ? query.sortBy : 'createdAt',
        //     sortDirection: query.sortDirection ? query.sortDirection : 'desc',
        // }
    }



    async commentOutput(id: string) {
        // const comment = await this.commentModel.findById(id)
        // if (!comment) {
        //     throw new NotFoundException("Comment not found")
        // }
        // return this.commentOutputMap(comment as unknown as HydratedDocument<CommentViewModel>)
    }

    commentOutputMap(comment: any): CommentViewModel {
        if (!comment) {
            throw new NotFoundException("Comment not found")
        }
        const {_id, content, commentatorInfo, likesInfo, createdAt} = comment
        return {
            id: _id.toString(),
            content,
            commentatorInfo,
            likesInfo: {
                likesCount: likesInfo.likesCount,
                dislikesCount: likesInfo.dislikesCount
            },
            createdAt
        }
    }

}
