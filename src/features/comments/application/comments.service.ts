import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentCreateModel } from '../api/models/input/create-comment.input.model';
import { TokensService } from '../../tokens/application/tokens.service';
import { CommentViewModel } from '../api/models/output/comment.view.model';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { PostsRepository } from '../../posts/infrastructure/posts.repository';
import { CommentsRepository } from '../infrastructure/comments.repository';
import { LikeStatus } from '../../posts/api/models/output/post.view.model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CommentsService {
  constructor(
    private readonly tokensService: TokensService,
    private readonly usersRepository: UsersRepository,
    private readonly postsRepository: PostsRepository,
    private readonly commentsRepository: CommentsRepository,
    @InjectDataSource() private readonly dataSource: DataSource
  ) {
  }

  async createComment(commentDto: CommentCreateModel, postId: string, bearerHeader: string) {
    const token = this.tokensService.getToken(bearerHeader);
    const decodedToken = this.tokensService.decodeToken(token);
    const user = await this.usersRepository.findUserById(decodedToken._id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const findedPost = await this.postsRepository.findPostById(postId);
    const newCommentId = await this.commentsRepository.createComment(
      commentDto,
      {userId: user.id, userLogin: user.login},
      postId
    )
    // const newComment = new this.commentModel({
    //   ...comment,
    //   postId,
    //   commentatorInfo: { userId: user._id, userLogin: user.login },
    // });
    // const saveData = await this.commentsRepository.saveComment(newComment);
    return newCommentId
  }

  async updateCommentById(id: string, dto: CommentCreateModel, bearerHeader: string) {
    // const user = await this.usersRepository.findUserByToken(bearerHeader);
    // if (!isValidObjectId(id)) {
    //   throw new NotFoundException(`Comment with id ${id} not found`);
    // }
    // const findedComment = await this.commentModel.findById(id);
    // if (!findedComment) {
    //   throw new NotFoundException(`Comment with id ${id} not found`);
    // }
    // const isOwner = this.usersCheckHandler.checkIsOwner(findedComment.commentatorInfo.userId, user?.id);
    // if (isOwner) {
    //   findedComment.content = dto.content;
    //   await findedComment.save();
    //   return findedComment;
    // }
  }

  async deleteCommentById(id: string, bearerHeader: string) {
    // const user = await this.usersRepository.findUserByToken(bearerHeader);
    // if (!isValidObjectId(id)) {
    //   throw new NotFoundException(`Comment with id ${id} not found`);
    // }
    // const findedComment = await this.commentModel.findById(id);
    // if (!findedComment) {
    //   throw new NotFoundException(`Comment with id ${id} not found`);
    // }
    // const isOwner = this.usersCheckHandler.checkIsOwner(findedComment.commentatorInfo.userId, user?.id);
    // if (isOwner) {
    //   const deleteComment = await this.commentModel.deleteOne({ _id: id });
    //   return deleteComment;
    // }
  }

  async updateCommentByIdWithLikeStatus(bearerHeader: string, commentId: string) {
    // const token = this.tokensService.getToken(bearerHeader);
    // const decodedToken: any = this.tokensService.validateAccessToken(token);
    // const user: HydratedDocument<User> | null = await this.userModel.findById(decodedToken?._id);
    // if (!user) {
    //   throw new NotFoundException('User not found');
    // }
    // const findedComment = await this.commentModel.findById(commentId);
    // if (!findedComment) {
    //   throw new NotFoundException('Post not found');
    // }
    // return {
    //   findedComment,
    //   user,
    // };
  }

  async generateCommentsData(items: CommentViewModel[], bearerHeader: string) {
    const commentsMap = await Promise.all(items.map(async (item) => {
        return this.generateNewCommentData(item, bearerHeader);
      }),
    );
    return commentsMap;
  }

  async generateNewCommentData(item: any, bearerHeader: string) {
    // const isUserExists = await this.usersRepository.findUserByToken(bearerHeader);
    let user
    if (bearerHeader) {
      const token = this.tokensService.getToken(bearerHeader);
      const decodedToken = this.tokensService.decodeToken(token);
      user = await this.usersRepository.findUserById(decodedToken._id);
    } else {
      user = null
    }

    // const likeStatus = await this.likeModel.findOne({ commentId: item.id, userId: isUserExists?._id });
    const likeStatus = await this.dataSource.query(
      `
            SELECT "status"
            FROM likes
            WHERE "commentId" = $1 AND "userId" = $2  
      `,
      [item.id, user?.id]
    )
    const myStatus = user && likeStatus.length ? likeStatus.status : LikeStatus.None;
    const newCommentData = this.addStatusPayload(item, myStatus);
    return newCommentData;
  }

  addStatusPayload(comment: CommentViewModel, status?: string) {
    const newStatus = status ? status : LikeStatus.None;
    return {
      ...comment,
      likesInfo: {
        ...comment.likesInfo,
        myStatus: newStatus,
      },
    };
  }

}
