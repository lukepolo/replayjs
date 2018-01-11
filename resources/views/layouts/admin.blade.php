<!doctype html>
<html lang="{{ app()->getLocale() }}">
    <head>
        <meta charset="utf-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title>Support Chat</title>

        <!-- Styles -->
        <link href="{{ mix('/css/app.css') }}" rel="stylesheet">

        <script>
            window.Laravel = <?php echo json_encode([
                'csrfToken' => csrf_token(),
            ]); ?>
        </script>
        <script src="http://support-chat.test:6001/socket.io/socket.io.js"></script>
    </head>
   <body>
       <div id="app">
         @yield('content')
       </div>

        @stack('scripts')

        <!-- Scripts -->
        <script src="{{ mix('/js/app.js') }}"></script>
   </body>
</html>