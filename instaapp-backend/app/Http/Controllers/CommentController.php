<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class CommentController extends Controller
{
    public function deleteComment($postId, $commentId)
    {
        $post = Post::find($postId);
        if (!$post) {
            return response()->json(['message' => 'Post not found'], 404);
        }

        $comment = Comment::where('id', $commentId)->where('post_id', $postId)->first();
        if (!$comment) {
            return response()->json(['message' => 'Comment not found'], 404);
        }

        if ($comment->user_id !== auth()->id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $comment->delete();

        return response()->json(['message' => 'Comment deleted successfully']);
    }

    public function replyComment(Request $request, $commentId)
    {
        $request->validate([
            'content' => 'required|string|max:300'
        ]);

        $comment = Comment::findOrFail($commentId);

        $reply              = new Comment();
        $reply->user_id     = Auth::id();
        $reply->post_id     = $comment->post_id;
        $reply->parent_id   = $comment->id;
        $reply->content     = $request->content;
        $reply->save();

        return response()->json([
            'message'   => 'Reply added successfully',
            'reply'     => $reply->load('user')
        ]);
    }

    public function comment(Request $request, $postId)
    {
        $request->validate([
            'content' => 'required|string|max:300'
        ]);

        $post = Post::findOrFail($postId);

        $comment            = new Comment();
        $comment->user_id   = Auth::id();
        $comment->post_id   = $post->id;
        $comment->content   = $request->content;
        $comment->save();

        $newComment = Comment::with('user')->find($comment->id);

        return response()->json([
            'message'   => 'Comment added successfully',
            'comment'   => $newComment, // Hanya kirim komentar baru, bukan semua komentar
            'comments'  => $post->comments()->with('user')->get() // Semua komentar dengan user
        ]);
    }
}
