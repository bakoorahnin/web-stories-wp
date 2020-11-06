<?php
/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

namespace Google\Web_Stories\Tests;

use Google\Web_Stories\Settings;
use Google\Web_Stories\Story_Post_Type;

/**
 * @coversDefaultClass \Google\Web_Stories\Integrations\Site_Kit
 */
class Site_Kit extends \WP_UnitTestCase {
	use Private_Access;

	/**
	 * Story id.
	 *
	 * @var int
	 */
	protected static $story_id;

	public static function wpSetUpBeforeClass( $factory ) {
		self::$story_id = $factory->post->create(
			[
				'post_type'    => Story_Post_Type::POST_TYPE_SLUG,
				'post_title'   => 'Example title',
				'post_status'  => 'publish',
				'post_content' => 'Example content',
			]
		);
	}

	/**
	 * @covers ::init
	 */
	public function test_init() {
		$analytics = $this->createMock( \Google\Web_Stories\Analytics::class );
		add_action( 'web_stories_print_analytics', [ $analytics, 'print_analytics_tag' ] );

		$site_kit = new \Google\Web_Stories\Integrations\Site_Kit( $analytics );
		$site_kit->init();

		$this->assertSame( 10, has_filter( 'googlesitekit_amp_gtag_opt', [ $site_kit, 'filter_site_kit_gtag_opt' ] ) );
		$this->assertSame( 10, has_action( 'web_stories_print_analytics', [ $analytics, 'print_analytics_tag' ] ) );
	}

	/**
	 * @covers ::init
	 * @runInSeparateProcess
	 * @preserveGlobalState disabled
	 */
	public function test_init_analytics_module_active() {
		define( 'GOOGLESITEKIT_VERSION', '1.2.3' );
		update_option( 'googlesitekit_active_modules', [ 'analytics' ], false );

		$analytics = $this->createMock( \Google\Web_Stories\Analytics::class );
		add_action( 'web_stories_print_analytics', [ $analytics, 'print_analytics_tag' ] );

		$site_kit = new \Google\Web_Stories\Integrations\Site_Kit( $analytics );
		$site_kit->init();

		$this->assertSame( 10, has_filter( 'googlesitekit_amp_gtag_opt', [ $site_kit, 'filter_site_kit_gtag_opt' ] ) );
		$this->assertFalse( has_action( 'web_stories_print_analytics', [ $analytics, 'print_analytics_tag' ] ) );
	}

	/**
	 * @covers ::filter_site_kit_gtag_opt
	 */
	public function test_filter_site_kit_gtag_opt() {
		$gtag = [
			'vars'     => [
				'gtag_id' => 'hello',
			],
			'triggers' => [],
		];

		$site_kit = new \Google\Web_Stories\Integrations\Site_Kit( $this->createMock( \Google\Web_Stories\Analytics::class ) );
		$actual   = $site_kit->filter_site_kit_gtag_opt( $gtag );

		$this->assertSame( $gtag, $actual );
	}

	/**
	 * @covers ::filter_site_kit_gtag_opt
	 * @runInSeparateProcess
	 * @preserveGlobalState disabled
	 */
	public function test_filter_site_kit_gtag_opt_single_story() {
		$gtag = [
			'vars'     => [
				'gtag_id' => 'hello',
			],
			'triggers' => [],
		];

		$this->go_to( get_permalink( self::$story_id ) );

		$analytics = $this->createMock( \Google\Web_Stories\Analytics::class );
		$analytics->method( 'get_default_configuration' )
				->willReturn(
					[
						'triggers' => [
							'storyProgress' => [],
							'storyEnd'      => [],
						],
					]
				);

		$site_kit = new \Google\Web_Stories\Integrations\Site_Kit( $analytics );
		$actual   = $site_kit->filter_site_kit_gtag_opt( $gtag );

		$this->assertArrayHasKey( 'storyProgress', $actual['triggers'] );
		$this->assertArrayHasKey( 'storyEnd', $actual['triggers'] );
	}

	/**
	 * @covers ::get_site_kit_active_modules_option
	 * @runInSeparateProcess
	 * @preserveGlobalState disabled
	 */
	public function test_get_site_kit_active_modules_option() {
		define( 'GOOGLESITEKIT_VERSION', '1.2.3' );

		$analytics = $this->createMock( \Google\Web_Stories\Analytics::class );
		$site_kit  = new \Google\Web_Stories\Integrations\Site_Kit( $analytics );

		$actual_before = $this->call_private_method( $site_kit, 'get_site_kit_active_modules_option' );

		update_option( 'googlesitekit_active_modules', [ 'analytics' ], false );

		$actual_after = $this->call_private_method( $site_kit, 'get_site_kit_active_modules_option' );

		delete_option( 'googlesitekit_active_modules' );
		update_option( 'googlesitekit-active-modules', [ 'analytics' ], false );

		$actual_after_legacy = $this->call_private_method( $site_kit, 'get_site_kit_active_modules_option' );

		$this->assertEmpty( $actual_before );
		$this->assertSame( [ 'analytics' ], $actual_after );
		$this->assertSame( [ 'analytics' ], $actual_after_legacy );
	}

	/**
	 * @covers ::get_plugin_status
	 */
	public function test_get_plugin_status() {
		$analytics = $this->createMock( \Google\Web_Stories\Analytics::class );
		$site_kit  = new \Google\Web_Stories\Integrations\Site_Kit( $analytics );

		$expected = [
			'installed'       => false,
			'active'          => false,
			'analyticsActive' => false,
			'link'            => __( 'https://wordpress.org/plugins/google-site-kit/', 'web-stories' ),
		];

		$actual = $site_kit->get_plugin_status();

		$this->assertEqualSetsWithIndex( $expected, $actual );
	}

	/**
	 * @covers ::get_plugin_status
	 * @runInSeparateProcess
	 * @preserveGlobalState disabled
	 */
	public function test_get_plugin_status_analytics_active() {

	}
}
