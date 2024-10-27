import { Injectable } from '@nestjs/common';
import {PostsRepository} from "../infrastructure/posts.repository";
import { PostCreateModel, PostCreateModelWithParams } from '../api/models/input/create-post.input.model';
import {BlogsService} from "../../blogs/application/blogs.service";
import { TokensService } from '../../tokens/application/tokens.service';
import { LikeStatus, PostViewModel } from '../api/models/output/post.view.model';
import { UsersService } from '../../users/application/users.service';
import { BlogsRepository } from '../../blogs/infrastructure/blogs.repository';
import { UsersRepository } from '../../users/infrastructure/users.repository';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PostsService {
    constructor(
        private readonly postsRepository: PostsRepository,
        private readonly blogsService: BlogsService,
        private readonly tokensService: TokensService,
        private readonly usersRepository: UsersRepository,
        private readonly blogsRepository: BlogsRepository,
        @InjectDataSource() private readonly dataSource: DataSource
    ) {
    }

    async createPost(post: PostCreateModel) {
        const findedBlog = await this.blogsRepository.findBlogById(post.blogId)
        const newPostId = await this.postsRepository.createPost(post, findedBlog.name)
        return newPostId
    }

    async updatePost(id: string, dto: PostCreateModel) {
        // const post = await this.postModel.findOne({_id: id})
        // if (!post) {
        //     throw new NotFoundException(`Post with id ${id} not found`)
        // }
        // const updatePost = await this.postsRepository.updatePost(post.id, dto)
        // return updatePost
    }

    async deletePost(id: string) {
        // const findedPost = await this.postModel.findById(id)
        // if (!findedPost) {
        //     throw new NotFoundException(`Post with id ${id} not found`)
        // }
        // const deletePost = await this.postModel.deleteOne({_id: id})
        // return deletePost
    }

    async updatePostByIdWithLikeStatus(bearerHeader: string, postId: string) {
        const token = this.tokensService.getToken(bearerHeader);
        const decodedToken: any = this.tokensService.decodeToken(token);
        const user = await this.usersRepository.findUserById(decodedToken?._id);
        const findedPost = await this.postsRepository.findPostById(postId);
        return {
            findedPost,
            user
        }
    }

    async generatePostsWithLikesDetails(items: PostCreateModel[], bearerToken: string) {
        // const newItems = await Promise.all(
        //   items.map(async (item) => {
        //         return this.generateOnePostWithLikesDetails(item, bearerToken)
        //     }
        //   )
        // )
        // return newItems
    }

    async generateOnePostWithLikesDetails(post: any , bearerHeader: string) {
        // const isUserExists = await this.usersRepository.findUserByToken(bearerHeader)
        let user
        if (bearerHeader) {
            const token = this.tokensService.getToken(bearerHeader);
            const decodedToken = this.tokensService.decodeToken(token);
            user = await this.usersRepository.findUserById(decodedToken._id);
        } else {
            user = null
        }
        // const likeStatus = await this.likeModel.findOne({userId: isUserExists?._id, postId: post.id})
        const likeStatus = await this.dataSource.query(
          `
            SELECT "status"
            FROM likes
            WHERE "postId" = $1 AND "userId" = $2  
      `,
          [post.id, user?.id]
        )
        const likeDetails = await this.dataSource.query(
          `
                    SELECT *
                    FROM likes
                    WHERE "postId" = $1 AND "status" = $2
                    ORDER BY "createdAt" DESC
                    LIMIT 3
                              
          `,
          [post.id, LikeStatus.Like]
        )
        // const likeDetails = await this.likeModel.find({
        //     postId: post.id,
        //     status: LikeStatus.Like
        // })
        //   .limit(3)
        //   .sort({createdAt: -1})
        const likeDetailsMap = await Promise.all(
          likeDetails.map(async (like: any) => {
              const user = await this.usersRepository.findUserById(like.userId)
              return {
                  addedAt: like.createdAt,
                  userId: like.userId,
                  login: user.login
              }
          })
        )
        const myStatus = user && likeStatus ? likeStatus?.status : LikeStatus.None
        const postDataWithInfo = this.statusAndNewLikesPayload(post, myStatus, likeDetailsMap)
        return postDataWithInfo
    }

    statusAndNewLikesPayload(post: any, status?: string, newestLikes?: any) {
        const newStatus = status ? status : LikeStatus.None
        const newLikes = newestLikes ? newestLikes : []
        return {
            ...post,
            extendedLikesInfo: {
                likesCount: post.extendedLikesInfoLikesCount,
                dislikesCount: post.extendedLikesInfoDislikesCount,
                myStatus: newStatus,
                newestLikes: newLikes
            }
        }
    }

}
