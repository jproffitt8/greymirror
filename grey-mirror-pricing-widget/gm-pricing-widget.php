<?php
/*
Plugin Name: Grey Mirror Pricing Calculator
Description: Elementor widget for Grey Mirror pricing calculator.
Version: 0.1.0
*/

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

class GM_Pricing_Plugin {
    const VERSION = '0.1.0';
    public function __construct() {
        add_action('elementor/widgets/register', [$this, 'register_widget']);
        add_action('wp_enqueue_scripts', [$this, 'enqueue']);
    }

    public function register_widget($widgets_manager) {
        require_once __DIR__ . '/widget.php';
        $widgets_manager->register(new GM_Pricing_Widget());
    }

    public function enqueue() {
        wp_register_script('gm-pricing-widget', plugins_url('widget.js', __FILE__), ['jquery'], self::VERSION, true);
        wp_enqueue_script('gm-pricing-widget');
        wp_register_style('gm-pricing-widget', plugins_url('style.css', __FILE__), [], self::VERSION);
        wp_enqueue_style('gm-pricing-widget');
    }
}
new GM_Pricing_Plugin();
