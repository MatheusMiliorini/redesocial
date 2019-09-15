<?php

namespace App\Http\Middleware;

use Closure;

class UserLogged
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
        $usuario = session('usuario');
        
        if (is_null($usuario)) {
            return redirect('/login');
        }

        return $next($request);
    }
}
