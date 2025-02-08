<?php

namespace App\Http\Controllers;

use App\Models\Like;
use App\Models\Post;
use App\Models\Comment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
    public function index()
    {
        $posts = Post::with(['user', 'likes', 'comments.user'])
            ->orderBy('created_at', 'desc')
            ->paginate(5);

        return response()->json([
            'posts' => $posts->items(),
            'pagination' => [
                'current_page'  => $posts->currentPage(),
                'last_page'     => $posts->lastPage(),
            ],
        ]);
    }


    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'content'   => 'required|string|max:500',
                'image'     => 'required|image|mimes:jpeg,png,jpg,gif|max:5120'
            ]);

            $post           = new Post();
            $post->user_id  = Auth::id();
            $post->content  = $validatedData['content'];

            if ($request->hasFile('image')) {
                $imagePath      = $request->file('image')->store('posts', 'public');
                $post->image    = asset("storage/$imagePath");
            }

            $post->save();

            return response()->json([
                'message'   => 'Post created successfully',
                'post'      => $post->load(['user', 'likes', 'comments.user'])
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        }
    }

    public function like($postId)
    {
        $user = Auth::user();
        $post = Post::findOrFail($postId);

        $existingLike = Like::where('user_id', $user->id)->where('post_id', $post->id)->first();

        if ($existingLike) {
            $existingLike->delete();
        } else {
            Like::create([
                'user_id' => $user->id,
                'post_id' => $post->id
            ]);
        }

        return response()->json([
            'message'   => 'Like updated successfully',
            'likes'     => $post->likes()->count()
        ]);
    }

    public function delete($id)
    {
        $post = Post::find($id);

        if (!$post) {
            return response()->json(['message' => 'Post not found'], 404);
        }

        if ($post->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized to delete this post'], 403);
        }

        if ($post->image) {
            $imagePath = str_replace(asset('storage/'), '', $post->image);

            if (Storage::disk('public')->exists($imagePath)) {
                Storage::disk('public')->delete($imagePath);
            }
        }

        $post->delete();

        return response()->json(['message' => 'Post and image deleted successfully']);
    }
}
