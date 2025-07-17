<?php

class Brainstorm {


    public static function API_KEY() {
        static $key = null;
        if(!$key) {
            if(!$jsfile = realpath(__DIR__.'/../../../theme/scripts/brainstorm.js')) return false;
            if(!$contents = file_get_contents($jsfile)) return false;
            if(!preg_match('#BRAINSTORM_API = \'([^\']+)\'#i', $contents, $m)) return false;
            $key = $m[1];
        }
        return $key;
    }


    public static function getCards() {
        if(!$results = self::curlGet()) return false;
        if($results->status != 'success') err("Failed to retrieve cards.");
        if($results->count > 0) $cards = $results->rows;
        else $cards = [];
        return $cards;
    }


    public static function update($uuid, $data) {

    }


    public static function updateImage($uuid, $data) {
        print_r(self::curlPost([
            'action' => 'update_image',
            'id' => $uuid,
            'values' => $data,
        ]));

    }


    private static function curlGet($params = null) {
        $chnd = self::curlInit();
        $result = curl_exec($chnd);
        $info = curl_getinfo($chnd);
        curl_close($chnd);
        if($info['http_code'] != 200) return false;
        if(!$data = json_decode($result)) return false;
        return $data;
    }


    private static function curlPost(array $values) {
        $chnd = self::curlInit();
        curl_setopt_array($chnd, [
            CURLOPT_POST => true,
            CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded'],
            CURLOPT_POSTFIELDS => http_build_query(['data' => json_encode($values)])
        ]);
        $result = curl_exec($chnd);
        $info = curl_getinfo($chnd);
        curl_close($chnd);
        if($info['http_code'] != 200) return false;
        if(!$data = json_decode($result)) return false;
        return $data;
    }


    private static function curlInit($params = null) {
        $chnd = curl_init('https://script.google.com/macros/s/' . self::API_KEY() . '/exec');
        curl_setopt_array($chnd, [
            CURLOPT_AUTOREFERER    => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_SSL_VERIFYHOST => false,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_TIMEOUT        => 60,
            CURLOPT_CONNECTTIMEOUT => 10,
            CURLOPT_ENCODING       => 'gzip,deflate',
            CURLOPT_RETURNTRANSFER => 'true',
            CURLOPT_COOKIEFILE     => '',
            CURLOPT_COOKIEJAR      => '',
        ]);
        return $chnd;
    }



}