<?php

if (! function_exists('ddd')) {
    /**
     * Developer convenience.
     *
     * @param array $args
     * @return mixed
     */
    function ddd(...$args)
    {
        http_response_code(500);
        call_user_func_array('dd', $args);
    }
}