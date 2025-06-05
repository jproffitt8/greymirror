<?php
/*
Plugin Name: GM Price Calculator
Description: Sleek price calculator widget via shortcode [gm_price_calc].
Version: 1.0.0
*/

if (!defined('ABSPATH')) exit;

function gm_pc_enqueue_assets(){
    wp_enqueue_style('gm-pc-style', plugin_dir_url(__FILE__).'css/style.css', [], '1.0');
    wp_enqueue_script('gm-pc-script', plugin_dir_url(__FILE__).'js/script.js', [], '1.0', true);
}
add_action('wp_enqueue_scripts','gm_pc_enqueue_assets');

function gm_pc_shortcode(){
    return '<div id="gm-price-calculator" class="gm-pc-widget"></div>';
}
add_shortcode('gm_price_calc','gm_pc_shortcode');
?>
