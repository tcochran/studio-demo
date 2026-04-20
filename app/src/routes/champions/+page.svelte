<script lang="ts">
	let { data } = $props();

	let searchQuery = $state('');
	let selectedSkill = $state('');
	let selectedLocation = $state('');

	let filtered = $derived(
		data.champions.filter((c: any) => {
			const matchesSearch =
				!searchQuery ||
				c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				c.bio.toLowerCase().includes(searchQuery.toLowerCase());

			const matchesSkill = !selectedSkill || c.skills.includes(selectedSkill);
			const matchesLocation = !selectedLocation || c.location === selectedLocation;

			return matchesSearch && matchesSkill && matchesLocation;
		})
	);
</script>

<div class="container">
	<header>
		<nav class="breadcrumb"><a href="/">Training Portal</a> / Champions</nav>
		<h1>AI Champions Directory</h1>
		<p class="subtitle">Meet the AI champions driving adoption across the organization</p>
		<a href="/champions/enroll" class="enroll-link">Become a Champion</a>
	</header>

	<div class="filters">
		<input
			type="text"
			placeholder="Search by name, title, or keyword..."
			bind:value={searchQuery}
			class="search-input"
		/>
		<select bind:value={selectedSkill} class="filter-select">
			<option value="">All Skills</option>
			{#each data.skills as skill}
				<option value={skill}>{skill}</option>
			{/each}
		</select>
		<select bind:value={selectedLocation} class="filter-select">
			<option value="">All Locations</option>
			{#each data.locations as location}
				<option value={location}>{location}</option>
			{/each}
		</select>
	</div>

	<p class="results-count">{filtered.length} champion{filtered.length !== 1 ? 's' : ''}</p>

	<div class="champions-grid">
		{#each filtered as champion (champion.id)}
			<div class="champion-card">
				<div class="card-header">
					<div class="avatar">{champion.name.split(' ').map((n: string) => n[0]).join('')}</div>
					<div>
						<h3>{champion.name}</h3>
						<p class="title">{champion.title}</p>
						<p class="location">{champion.location}</p>
					</div>
				</div>
				<p class="bio">{champion.bio}</p>
				<div class="skills">
					{#each champion.skills as skill}
						<span class="skill-tag">{skill}</span>
					{/each}
				</div>
				<div class="achievements">
					<h4>Achievements</h4>
					<ul>
						{#each champion.achievements as achievement}
							<li>{achievement}</li>
						{/each}
					</ul>
				</div>
				<div class="card-footer">
					<span class="joined">Joined {new Date(champion.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
					<a href="mailto:{champion.contact}" class="contact-link">Contact</a>
				</div>
			</div>
		{/each}
	</div>

	{#if filtered.length === 0}
		<p class="empty-state">No champions match your filters. Try adjusting your search.</p>
	{/if}
</div>

<style>
	.container {
		max-width: 800px;
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

	.enroll-link {
		display: inline-block;
		margin-top: 0.75rem;
		padding: 0.5rem 1rem;
		background: #1d4ed8;
		color: #fff;
		text-decoration: none;
		border-radius: 6px;
		font-size: 0.85rem;
		font-weight: 600;
	}

	.enroll-link:hover {
		background: #1e40af;
	}

	.filters {
		display: flex;
		gap: 0.75rem;
		margin-bottom: 1rem;
		flex-wrap: wrap;
	}

	.search-input {
		flex: 1;
		min-width: 200px;
		padding: 0.5rem 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.875rem;
	}

	.search-input:focus {
		outline: none;
		border-color: #1d4ed8;
		box-shadow: 0 0 0 2px rgba(29, 78, 216, 0.1);
	}

	.filter-select {
		padding: 0.5rem 0.75rem;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 0.875rem;
		background: #fff;
	}

	.results-count {
		font-size: 0.85rem;
		color: #888;
		margin: 0 0 1rem;
	}

	.champions-grid {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.champion-card {
		border: 1px solid #e2e2e2;
		border-radius: 8px;
		padding: 1.25rem;
		background: #fff;
	}

	.card-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 0.75rem;
	}

	.avatar {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: #e0e7ff;
		color: #3730a3;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		font-size: 0.9rem;
		flex-shrink: 0;
	}

	h3 {
		font-size: 1rem;
		font-weight: 600;
		color: #111;
		margin: 0;
	}

	.title {
		font-size: 0.85rem;
		color: #555;
		margin: 0.1rem 0 0;
	}

	.location {
		font-size: 0.8rem;
		color: #888;
		margin: 0.1rem 0 0;
	}

	.bio {
		font-size: 0.875rem;
		color: #555;
		line-height: 1.5;
		margin: 0 0 0.75rem;
	}

	.skills {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin-bottom: 0.75rem;
	}

	.skill-tag {
		font-size: 0.7rem;
		font-weight: 600;
		padding: 0.2rem 0.5rem;
		border-radius: 4px;
		background: #f0f9ff;
		color: #1d4ed8;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.achievements h4 {
		font-size: 0.8rem;
		font-weight: 600;
		color: #333;
		margin: 0 0 0.3rem;
	}

	.achievements ul {
		margin: 0;
		padding-left: 1.25rem;
	}

	.achievements li {
		font-size: 0.825rem;
		color: #555;
		line-height: 1.5;
	}

	.card-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 0.75rem;
		padding-top: 0.75rem;
		border-top: 1px solid #f0f0f0;
	}

	.joined {
		font-size: 0.75rem;
		color: #aaa;
	}

	.contact-link {
		font-size: 0.8rem;
		color: #1d4ed8;
		text-decoration: none;
		font-weight: 500;
	}

	.contact-link:hover {
		text-decoration: underline;
	}

	.empty-state {
		text-align: center;
		color: #888;
		padding: 2rem;
		font-size: 0.9rem;
	}
</style>
