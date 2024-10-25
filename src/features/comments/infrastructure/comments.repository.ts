import { Injectable, NotFoundException } from '@nestjs/common';


@Injectable()
export class CommentsRepository {
    constructor(
    ) {
    }

    async findCommentById(id: string) {
        // if (!isValidObjectId(id)) {
        //     throw new NotFoundException(`Comment with id ${id} not found`);
        // }
        // const findedComment = this.commentModel.findById(id)
        // if (!findedComment) {
        //     throw new NotFoundException(`Could not find comment with id ${id}`)
        // }
        // return findedComment
    }

    async saveComment(comment: any) {
        const saveComment = await comment.save()
        return saveComment
    }

}
