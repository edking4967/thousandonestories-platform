<?php
/*
 * Template Name: Stories
 * Description: Stories page for thousandonestories.com
 */


get_header(); ?>
<style>
	#fundiv
	{
		background-color:white;
		text-align:center;
	}
	.white
	{
		background-color:white;
		padding:10px;
		margin:10px;
		width:20%
	}
</style>
	<div id="primary" class="content-area">
		<div id="content" class="site-content" role="main">
			<?php while ( have_posts() ) : the_post(); ?>

				<?php get_template_part( 'content', 'page' ); ?>

				<div id="fundiv">GRIDLOCK</div>
				<?php
					// If comments are open or we have at least one comment, load up the comment template
					if ( comments_open() || '0' != get_comments_number() )
						comments_template();
				?>

<?php


$args = array( 'posts_per_page' => 5, 'offset'=> 1, 'category' => 1 );

$myposts = get_posts( $args );
foreach ( $myposts as $post ) : setup_postdata( $post ); ?>
	<div class="white"><a href="<?php the_permalink(); ?>"><?php the_title(); ?></a></div>
<?php endforeach; 
wp_reset_postdata();?>


			<?php endwhile; // end of the loop. ?>

		</div><!-- #content -->
	</div><!-- #primary -->

<?php get_footer(); ?>
