<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class GM_Quiz_Elementor_Widget extends \Elementor\Widget_Base {
    public function get_name() {
        return 'gm_quiz';
    }

    public function get_title() {
        return __( 'Service Match Quiz', 'gm-quiz' );
    }

    public function get_icon() {
        return 'eicon-question';
    }

    public function get_categories() {
        return [ 'general' ];
    }

    public function get_style_depends() {
        return [ 'gm-quiz' ];
    }

    public function get_script_depends() {
        return [ 'gm-quiz' ];
    }

    protected function register_controls() {
        $this->start_controls_section( 'content_section', [
            'label' => __( 'Content', 'gm-quiz' ),
        ] );

        $this->add_control( 'heading', [
            'label' => __( 'Heading', 'gm-quiz' ),
            'type' => \Elementor\Controls_Manager::TEXTAREA,
            'default' => __( 'We have 2 047 unique service plans.<br>Let’s find the one that fits your practice.', 'gm-quiz' ),
        ] );

        $this->add_control( 'start_text', [
            'label' => __( 'Start Button Text', 'gm-quiz' ),
            'type' => \Elementor\Controls_Manager::TEXT,
            'default' => __( 'Start 30-second Quiz →', 'gm-quiz' ),
        ] );

        $this->add_control( 'accent_color', [
            'label' => __( 'Accent Color', 'gm-quiz' ),
            'type' => \Elementor\Controls_Manager::COLOR,
            'default' => '#0d90ff',
        ] );

        $this->end_controls_section();
    }

    protected function render() {
        $settings = $this->get_settings_for_display();
        echo do_shortcode( sprintf(
            '[gm_quiz heading="%s" start_text="%s" accent_color="%s"]',
            esc_attr( $settings['heading'] ),
            esc_attr( $settings['start_text'] ),
            esc_attr( $settings['accent_color'] )
        ) );
    }
}
