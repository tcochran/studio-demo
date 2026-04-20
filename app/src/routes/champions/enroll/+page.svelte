<script lang="ts">
	import { enhance } from '$app/forms';
	let { data, form } = $props();
</script>

<div class="container">
	<header>
		<nav class="breadcrumb"><a href="/">Training Portal</a> / <a href="/champions">Champions</a> / Enroll</nav>
		<h1>Become an AI Champion</h1>
		<p class="subtitle">Join the directory and help drive AI adoption across the organization</p>
	</header>

	<form method="POST" use:enhance>
		<div class="field">
			<label for="name">Full Name <span class="req">*</span></label>
			<input id="name" name="name" type="text" value={form?.values?.name ?? ''} />
			{#if form?.errors?.name}<p class="error">{form.errors.name}</p>{/if}
		</div>

		<div class="field">
			<label for="title">Job Title <span class="req">*</span></label>
			<input id="title" name="title" type="text" value={form?.values?.title ?? ''} />
			{#if form?.errors?.title}<p class="error">{form.errors.title}</p>{/if}
		</div>

		<div class="field">
			<label for="location">Location <span class="req">*</span></label>
			<input id="location" name="location" type="text" placeholder="e.g. San Francisco, CA or Remote" value={form?.values?.location ?? ''} />
			{#if form?.errors?.location}<p class="error">{form.errors.location}</p>{/if}
		</div>

		<div class="field">
			<label for="contact">Contact Email <span class="req">*</span></label>
			<input id="contact" name="contact" type="email" value={form?.values?.contact ?? ''} />
			{#if form?.errors?.contact}<p class="error">{form.errors.contact}</p>{/if}
		</div>

		<fieldset class="field">
			<legend>Skills <span class="req">*</span></legend>
			<div class="skills-grid">
				{#each data.availableSkills as skill}
					<label class="checkbox-label">
						<input type="checkbox" name="skills" value={skill} checked={form?.values?.skills?.includes(skill) ?? false} />
						{skill}
					</label>
				{/each}
			</div>
			{#if form?.errors?.skills}<p class="error">{form.errors.skills}</p>{/if}
		</fieldset>

		<div class="field">
			<label for="bio">Bio <span class="req">*</span></label>
			<textarea id="bio" name="bio" rows="4" placeholder="Tell us about your AI experience and what you'd like to champion...">{form?.values?.bio ?? ''}</textarea>
			{#if form?.errors?.bio}<p class="error">{form.errors.bio}</p>{/if}
		</div>

		<button type="submit" class="submit-btn">Submit Enrollment</button>
	</form>
</div>

<style>
	.container {
		max-width: 600px;
		margin: 0 auto;
		padding: 2rem;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
	}

	.breadcrumb {
		font-size: 0.85rem;
		color: #888;
		margin-bottom: 0.5rem;
	}

	.breadcrumb a {
		color: #1d4ed8;
		text-decoration: none;
	}

	.breadcrumb a:hover {
		text-decoration: underline;
	}

	header {
		margin-bottom: 1.5rem;
	}

	h1 {
		font-size: 1.75rem;
		font-weight: 700;
		color: #111;
		margin: 0;
	}

	.subtitle {
		color: #666;
		margin: 0.25rem 0 0;
		font-size: 0.95rem;
	}

	.field {
		margin-bottom: 1.25rem;
	}

	label {
		display: block;
		font-size: 0.875rem;
		font-weight: 600;
		color: #333;
		margin-bottom: 0.35rem;
	}

	.req {
		color: #b91c1c;
	}

	input[type='text'],
	input[type='email'],
	textarea {
		width: 100%;
		padding: 0.5rem 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.875rem;
		font-family: inherit;
		box-sizing: border-box;
	}

	input:focus,
	textarea:focus {
		outline: none;
		border-color: #1d4ed8;
		box-shadow: 0 0 0 2px rgba(29, 78, 216, 0.1);
	}

	fieldset {
		border: 1px solid #e2e2e2;
		border-radius: 6px;
		padding: 1rem;
	}

	legend {
		font-size: 0.875rem;
		font-weight: 600;
		color: #333;
		padding: 0 0.25rem;
	}

	.skills-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.85rem;
		font-weight: 400;
		color: #555;
		cursor: pointer;
	}

	.error {
		color: #b91c1c;
		font-size: 0.8rem;
		margin: 0.25rem 0 0;
	}

	.submit-btn {
		background: #1d4ed8;
		color: #fff;
		border: none;
		padding: 0.65rem 1.5rem;
		border-radius: 6px;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		margin-top: 0.5rem;
	}

	.submit-btn:hover {
		background: #1e40af;
	}
</style>
