@extends('layouts.public')

@section('content')
    <notifications></notifications>
    <router-view></router-view>
@endsection

@push('scripts')
   <script>
        var user = {!! \Auth::user() !!};
   </script>
@endpush