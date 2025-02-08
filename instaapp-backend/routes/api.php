<?php

// use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\PostController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/posts', [PostController::class, 'index']); // ambil daftar postingan
    Route::post('/posts', [PostController::class, 'store']); // buat postingan baru
    Route::post('/posts/{postId}/like', [PostController::class, 'like']); //like atau unlike
    Route::delete('/posts/{id}', [PostController::class, 'delete']); // hapus postingan

    Route::post('/comments/{postId}/comment', [CommentController::class, 'comment']); // Tambah komentar
    Route::delete('/comments/{postId}/comment/{commentId}', [CommentController::class, 'deleteComment']); //hapus komentar
    Route::post('/comments/{commentId}/reply', [CommentController::class, 'replyComment']); //balas komentar
});
