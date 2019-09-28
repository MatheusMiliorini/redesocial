<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

class AuthController extends Controller
{
    /**
     * Retorna a view de login (GET)
     */
    public function login()
    {
        return view("login", [
            "title" => "Login",
        ]);
    }

    public function cadastro()
    {
        return view("cadastro", [
            "title" => "Cadastro",
        ]);
    }

    /**
     * Seta a sessão
     */
    public function iniciaSessao(Request $req)
    {
        $usuario = Usuario::where("email", $req->email)->first();
        if ($usuario && Hash::check($req->senha, $usuario->senha)) {
            session([
                "usuario" => $usuario
            ]);
            return response()->json([
                "completou_login" => $usuario->completou_login
            ]);
        } else {
            return response()->json([
                "erro" => "Dados de login incorretos!",
            ], 404);
        }
    }

    /**
     * Cadastra inicialmente um usuário no banco de dados
     */
    public function insereUsuario(Request $req)
    {
        $req->validate([
            "email" => "required|unique:usuarios",
            "nome"  => "required",
            "senha" => "required"
        ], [
            "email.unique" => "Este e-mail já se encontra em uso!"
        ]);

        $usuario = new Usuario();
        $usuario->fill($req->all());
        $usuario->senha = Hash::make($req->senha);
        $usuario->save();

        session([
            "usuario" => $usuario
        ]);

        return response()->json([
            "status" => "success"
        ]);
    }

    /**
     * Recebe o GET (retorna a view)
     */
    public function completarCadastro(Request $req)
    {
        return view("completarCadastro", [
            "title" => "Completar cadastro"
        ]);
    }

    /**
     * Recebe o POST (insere os dados)
     */
    public function completarCadastroPost(Request $req)
    {
        $dados = $req->validate([
            "foto"               => "nullable|image",
            "localizacao"        => "nullable|string",
            "nascimento"         => "nullable|date",
            "site"               => "nullable|string",
            "biografia"          => "nullable|string",
            "url_unica"          => "required|string|unique:usuarios",
            "interesse_id"       => "required|array|exists:interesses",
            "idioma_id"          => "required|array|exists:idiomas",
            "nivel_conhecimento" => "required|array|between:1,5"
        ], [
            "url_unica.required"    => "Por favor, escolha uma URL única para seu perfil.",
            "url_unica.unique"      => "Desculpe, essa URL única já se encontra em uso.",
            "interesse_id.required" => "Por favor, selecione ao menos um interesse.",
            "idioma_id.required"    => "Por favor, selecione ao menos um idioma.",
            "foto.image"            => "Por favor, escolha uma imagem válida.",
        ]);

        DB::beginTransaction();

        $usuario = Usuario::find($req->session()->get('usuario')->usuario_id);
        $usuario->fill($dados);
        if (isset($dados['foto'])) {
            $usuario->foto = $dados['foto']->store('avatares');
        }
        $usuario->completou_login = true;
        $usuario->save();

        // Insere os interesses
        $inserts = [];
        foreach ($dados['interesse_id'] as $interesse) {
            $inserts[] = ["usuario_id" => $usuario->usuario_id, "interesse_id" => $interesse];
        }
        DB::table("interesses_usuarios")->insert($inserts);

        // Insere os idiomas
        $inserts = [];
        foreach ($dados['idioma_id'] as $key => $idioma) {
            $inserts[] = [
                "usuario_id" => $usuario->usuario_id,
                "idioma_id"  => $idioma,
                "nivel_conhecimento" => $dados['nivel_conhecimento'][$key]
            ];
        }
        DB::table("idiomas_usuarios")->insert($inserts);

        DB::commit();
    }

    public function logout(Request $req)
    {
        $req->session()->flush();
        return redirect("/login");
    }

    /**
     * Exibe a view de meu perfil para edição
     */
    public function meuPerfil()
    {
        $usuario = DB::select("
            SELECT
                u.localizacao,
                u.biografia,
                u.site,
                u.biografia,
                u.url_unica,
                u.nascimento,
                COALESCE('storage/' || u.foto, 'https://api.adorable.io/avatars/256/'|| u.url_unica) AS foto
            FROM
                usuarios u
            WHERE usuario_id = ?
        ", [
            session('usuario')->usuario_id,
        ])[0];

        $interesses = DB::select("
            SELECT
                int.*
            FROM
                interesses int
            JOIN interesses_usuarios iu ON
                iu.interesse_id = int.interesse_id
            WHERE
                iu.usuario_id = ?
            ORDER BY
                int.nome
        ", [
            session('usuario')->usuario_id
        ]);

        return view('meuPerfil', [
            'title' => 'Meu Perfil',
            'usuario' => $usuario,
            'interesses' => $interesses
        ]);
    }

    /**
     * Recebe o POST para editar o perfil do usuário
     */
    public function alteraPerfil(Request $req)
    {
        $dados = $req->validate([
            "foto"               => "nullable|image",
            "localizacao"        => "nullable|string",
            "nascimento"         => "nullable|date",
            "site"               => "nullable|string",
            "biografia"          => "nullable|string",
            "url_unica"          => "required|string",
            "interesse_id"       => "required|array|exists:interesses",
            "idioma_id"          => "required|array|exists:idiomas",
            "nivel_conhecimento" => "required|array|between:1,5",
            "novasenha"          => "nullable",
            "novasenhaconfirm"   => "nullable",
        ], [
            "url_unica.required"    => "Por favor, escolha uma URL única para seu perfil.",
            "interesse_id.required" => "Por favor, selecione ao menos um interesse.",
            "idioma_id.required"    => "Por favor, selecione ao menos um idioma.",
            "foto.image"            => "Por favor, escolha uma imagem válida.",
        ]);

        DB::beginTransaction();

        $usuario = Usuario::find($req->session()->get('usuario')->usuario_id);
        $url_original = $usuario->url_unica;
        $foto_original = $usuario->foto;

        $usuario->fill($dados);
        if (isset($dados['foto'])) {
            $fotoAntiga = $foto_original;
            $usuario->foto = $dados['foto']->store('avatares');
        }

        if ($dados['url_unica'] !== $url_original) {
            // Verifica se já se encontra em uso
            $existe = DB::select("SELECT usuario_id FROM usuarios WHERE url_unica = ? AND usuario_id <> ?", [$dados['url_unica'], $usuario->usuario_id]);
            if ($existe) {
                return response()->json([
                    'erro' => 'Esta URL única já se encontra em uso por outro usuário!'
                ], 401);
            }
        }

        // Altera a senha
        if (!empty($dados['novasenha'])) {
            if ($dados['novasenha'] === $dados['novasenhaconfirm']) {
                $usuario->senha = Hash::make($dados['novasenha']);
            } else {
                return response()->json([
                    'erro' => 'As senhas não correspondem!',
                ], 401);
            }
        }

        $usuario->save();

        // Apaga a lista de interesses
        DB::delete("DELETE FROM interesses_usuarios WHERE usuario_id = ?", [$usuario->usuario_id]);
        // Insere os interesses
        $inserts = [];
        foreach ($dados['interesse_id'] as $interesse) {
            $inserts[] = ["usuario_id" => $usuario->usuario_id, "interesse_id" => $interesse];
        }
        DB::table("interesses_usuarios")->insert($inserts);

        // Limpa a lista de idiomas
        DB::delete("DELETE FROM idiomas_usuarios WHERE usuario_id = ?", [$usuario->usuario_id]);
        // Insere os idiomas
        $inserts = [];
        foreach ($dados['idioma_id'] as $key => $idioma) {
            $inserts[] = [
                "usuario_id" => $usuario->usuario_id,
                "idioma_id"  => $idioma,
                "nivel_conhecimento" => $dados['nivel_conhecimento'][$key]
            ];
        }
        DB::table("idiomas_usuarios")->insert($inserts);

        DB::commit();

        if (isset($fotoAntiga)) {
            Storage::delete($fotoAntiga);
        }
    }

    /**
     * Retorna a lista de idiomas do usuário
     */
    public function meusIdiomas()
    {
        $idiomas = DB::select("
            SELECT * FROM idiomas_usuarios WHERE usuario_id = ?
        ", [
            session('usuario')->usuario_id
        ]);

        return response()->json($idiomas);
    }

    public function recuperarSenha()
    {
        return view('recuperarSenha', [
            'title' => 'Recuperar senha'
        ]);
    }

    /**
     * Usuário chega aqui a partir do e-mail
     */
    public function recuperarSenhaToken(string $token)
    {
        $usuario = Usuario::where('token_recuperacao', $token)->first();

        if (!$usuario) {
            return redirect('/login');
        }

        return view('atualizarSenha', [
            'title' => 'Atualizar Senha',
            'token' => $token,
        ]);
    }

    /**
     * Essa é a função que dá update na senha no banco
     */
    function recuperarSenhaPut(Request $req)
    {
        $dados = $req->validate([
            'senha' => 'required',
            'senha2' => 'required',
            'token_recuperacao' => 'required|exists:usuarios'
        ]);

        if ($dados['senha'] !== $dados['senha2']) {
            return response()->json([
                'erro' => 'As senhas não correspondem!',
            ], 401);
        }

        $usuario = Usuario::where('token_recuperacao', $dados['token_recuperacao'])->first();
        $usuario->senha = Hash::make($dados['senha']);
        $usuario->token_recuperacao = null;
        $usuario->save();

        return response()->json([
            'status' => 'success',
        ]);
    }

    /**
     * Envia e-mail com o token para recuperação de senha
     */
    public function recuperarSenhaPost(Request $req)
    {
        $usuario = Usuario::where('email', $req->email)->first();

        if (!$usuario) {
            return response()->json([
                'erro' => 'Usuário não localizado!'
            ], 404);
        }

        $usuario->token_recuperacao = md5('duck' . $usuario->url_unica);

        $mail = new PHPMailer(true);

        try {
            //Server settings
            $mail->SMTPDebug = SMTP::DEBUG_SERVER;                      // Enable verbose debug output
            $mail->isSMTP();                                            // Send using SMTP
            $mail->Host       = 'smtp.gmail.com';                    // Set the SMTP server to send through
            $mail->SMTPAuth   = true;                                   // Enable SMTP authentication
            $mail->Username   = 'miliorinimatheustc@gmail.com';                     // SMTP username
            $mail->Password   = env("MAIL_PASSWORD");                               // SMTP password
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;         // Enable TLS encryption; `PHPMailer::ENCRYPTION_SMTPS` also accepted
            $mail->Port       = 587;                                    // TCP port to connect to

            //Recipients
            $mail->setFrom('miliorinimatheustc@gmail.com', 'Rede Social');
            $mail->addAddress($usuario->email);     // Add a recipient

            // Content
            $mail->isHTML(true);                                  // Set email format to HTML
            $mail->Subject = 'Recuperar senha';
            $mail->Body    = '<p>Olá!</p><p>Utilize este link para recuperar sua senha: https://miliorini.ml/recuperarSenha/' . $usuario->token_recuperacao . '.</p>';

            $mail->send();

            $usuario->save();

            return response()->json([
                'status' => 'success'
            ]);
        } catch (Exception $e) {
            return response()->json([
                'erro' => 'Ocorreu um erro ao enviar o e-mail!',
                'realError' => $mail->ErrorInfo
            ], 500);
        }
    }
}
