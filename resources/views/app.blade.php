<!DOCTYPE html>
<html>

<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="csrf-token" content="{{ csrf_token() }}">
  <title>T.E.M.P.U.S.</title>
  <link rel="icon" href="/favicon.png" type="image/png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link
    href="https://cdn.jsdelivr.net/npm/remixicon@4.9.1/fonts/remixicon.css"
    rel="stylesheet" />
  @vite('resources/js/app.js')
  @vite('resources/css/app.css')
  @inertiaHead
</head>

<body>
  @inertia
</body>

</html>