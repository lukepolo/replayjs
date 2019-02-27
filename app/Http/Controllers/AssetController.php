<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AssetController extends Controller
{
    public $asset_url = 'AssetController@index';

    public function index()
      {
      	$url = \Request::input('url');
      	$asset_url = action($this->asset_url);
      	$cURL = curl_init($url);
              curl_setopt($cURL, CURLOPT_RETURNTRANSFER, 1);
              curl_setopt($cURL, CURLOPT_FOLLOWLOCATION, 1);
              //curl_setopt($cURL, CURLOPT_HEADER, 0);
              curl_setopt($cURL, CURLOPT_CONNECTTIMEOUT, 2);
              curl_setopt($cURL, CURLOPT_TIMEOUT, 3);
              curl_setopt($cURL, CURLOPT_SSL_VERIFYPEER, false);
              curl_setopt($cURL, CURLOPT_SSL_VERIFYHOST, false);
              $file = curl_exec($cURL);

              $http_status = curl_getinfo($cURL, CURLINFO_HTTP_CODE);
              $contentType = curl_getinfo($cURL, CURLINFO_CONTENT_TYPE);
              curl_close($cURL);

              if($http_status == 200)
              {
                  $parsed_url = parse_url($url);
                  if($contentType == 'text/css')
                  {
                      // Remove the quotes from the URL's as they are optional , which allows correcting much easier
                      // https://www.regex101.com/r/iU3kZ0/2
                      $file = preg_replace('/url\((\'|")(.*?)(\'|")/', 'url($2', $file);

                      // Fix urls with relative paths
                      // https://www.regex101.com/r/eS7gP8/16
                      $file = preg_replace('/url\((?!h|\/\/)(?:(\/|\.\.|[a-zA-Z]))(.*?)(?:\))/i',  'url('.$asset_url.'?url='.$parsed_url['host'].'$1$2)' , $file);
                  }

                  header('Content-Type: '.$contentType);
                  $nameOfFile= substr($parsed_url['path'], strrpos($parsed_url['path'], '/') + 1);
                  header('Content-Disposition: filename="'.$nameOfFile.'"');
                  echo $file;
              }
              else
              {
                  header("HTTP/1.1 404 Not Found");
              }
              exit();
          }
}
