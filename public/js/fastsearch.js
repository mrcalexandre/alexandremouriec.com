/*  
====================================================================

FAST SEARCH — 
https://gist.github.com/cmod/5410eae147e4318164258742dd053993
Updated to work with fuse 7 (Jan 2025)
Updated Feb 2025 — no more fuse dependency, more modern js, 
   proper config items, ability to easily modify shortcut, 
   general speed improvements

Updated Sep 2025
- Fixed search visibility issues with reliable state management
- Improved result link click handling with proper navigation timing
- Enhanced CSS class toggling with direct style manipulation fallback
- Added robust error handling and state validation
- Optimized for Astro's component architecture and Tailwind CSS classes
- Fixed keyboard shortcut reliability across multiple uses
- Improved focus management and accessibility
- Enhanced search result navigation and selection

==================================================================== 
*/
// Configuration
const DEFAULT_CONFIG = {
  shortcuts: {
    open: {
      // Shortcut to open/close search - try multiple keys for AZERTY compatibility
      key: "k", // Primary key
      metaKey: true, // Requires Cmd/Win key
      altKey: false, // Requires Alt key
      ctrlKey: false, // Requires Ctrl key
      shiftKey: false, // Requires Shift key
    },
    // Alternative shortcuts for AZERTY
    openAlt: {
      key: "K", // Capital K (Shift + k)
      metaKey: true,
      altKey: false,
      ctrlKey: false,
      shiftKey: true,
    },
  },
  search: {
    minChars: 2, // Minimum characters before searching
    maxResults: 5, // Maximum number of results to show
    fields: {
      // Fields to search through
      title: true, // Allow searching in title
      description: true, // Allow searching in description
      section: true, // Allow searching in section
    },
  },
};

// Function to initialize search with custom config
function initSearch(userConfig = {}) {
  // Deep merge of default config with user config
  const CONFIG = mergeConfigs(DEFAULT_CONFIG, userConfig);

  // Cache DOM elements
  const fastSearch = document.getElementById("fastSearch");
  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");

  // Check if all required elements exist
  if (!fastSearch || !searchInput || !searchResults) {
    console.error("Required DOM elements not found. Search will not work.");
    return;
  }

  let searchIndex = null;
  let searchVisible = false;
  let resultsAvailable = false;
  let firstRun = true;
  let isToggling = false;

  // Load the search index
  async function loadSearchIndex() {
    try {
      const response = await fetch("/search.json");
      if (!response.ok) throw new Error("Failed to load search index");
      const data = await response.json();

      searchIndex = data.map((item) => ({
        ...item,
        searchableTitle: item.title?.toLowerCase() || "",
        searchableDesc: item.desc?.toLowerCase() || "",
        searchableSection: item.section?.toLowerCase() || "",
      }));

      if (searchInput.value) {
        performSearch(searchInput.value);
      }
    } catch (error) {
      console.error("Error loading search index:", error);
      searchResults.innerHTML =
        '<li class="search-message">Error loading search index...</li>';
    }
  }

  // Enhanced weighted scoring system for better search results
  function calculateSearchScore(item, query) {
    const searchTerm = query.toLowerCase();
    let score = 0;

    // Exact matches get highest priority
    if (item.searchableTitle.includes(searchTerm)) {
      score += 100;
      // Bonus for title matches at the beginning
      if (item.searchableTitle.startsWith(searchTerm)) {
        score += 50;
      }
      // Bonus for exact word matches in title
      const titleWords = item.searchableTitle.split(/\s+/);
      if (titleWords.some((word) => word === searchTerm)) {
        score += 25;
      }
    }

    if (item.searchableDesc.includes(searchTerm)) {
      score += 30;
      // Bonus for exact word matches in description
      const descWords = item.searchableDesc.split(/\s+/);
      if (descWords.some((word) => word === searchTerm)) {
        score += 15;
      }
    }

    if (item.searchableSection.includes(searchTerm)) {
      score += 20;
    }

    // Fuzzy matches get lower priority
    if (simpleFuzzyMatch(item.searchableTitle, searchTerm)) {
      score += 10;
    }

    if (simpleFuzzyMatch(item.searchableDesc, searchTerm)) {
      score += 5;
    }

    if (simpleFuzzyMatch(item.searchableSection, searchTerm)) {
      score += 3;
    }

    // Bonus for recent content
    if (item.date) {
      const itemDate = new Date(item.date);
      const now = new Date();
      const daysDiff = (now - itemDate) / (1000 * 60 * 60 * 24);
      if (daysDiff < 30) score += 5; // Recent content bonus
      if (daysDiff < 7) score += 10; // Very recent content bonus
    }

    // Bonus for content type relevance
    if (item.type === "post" && searchTerm.length > 2) {
      score += 2; // Slight bonus for blog posts
    }

    return score;
  }

  // Simple fuzzy match for single words
  function simpleFuzzyMatch(text, term) {
    if (text.includes(term)) return true;
    if (term.length < 3) return false;

    let matches = 0;
    let lastMatchIndex = -1;

    for (let i = 0; i < term.length; i++) {
      const found = text.indexOf(term[i], lastMatchIndex + 1);
      if (found > -1) {
        matches++;
        lastMatchIndex = found;
      }
    }

    return matches === term.length;
  }

  // Check if keyboard event matches shortcut config
  function matchesShortcut(event, shortcutConfig) {
    return (
      event.key === shortcutConfig.key &&
      event.metaKey === shortcutConfig.metaKey &&
      event.altKey === shortcutConfig.altKey &&
      event.ctrlKey === shortcutConfig.ctrlKey &&
      event.shiftKey === shortcutConfig.shiftKey
    );
  }

  // Keyboard shortcuts
  function handleKeyDown(event) {
    // Check for search shortcut (primary)
    if (matchesShortcut(event, CONFIG.shortcuts.open)) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      toggleSearch();
      return;
    }

    // Check for alternative search shortcut
    if (
      CONFIG.shortcuts.openAlt &&
      matchesShortcut(event, CONFIG.shortcuts.openAlt)
    ) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      toggleSearch();
      return;
    }

    // Only handle navigation keys if search is visible
    if (!searchVisible) return;

    // Handle search navigation
    switch (event.key) {
      case "Escape":
        event.preventDefault();
        event.stopPropagation();
        hideSearch();
        break;
      case "ArrowDown":
        event.preventDefault();
        event.stopPropagation();
        navigateResults(1);
        break;
      case "ArrowUp":
        event.preventDefault();
        event.stopPropagation();
        navigateResults(-1);
        break;
      case "Enter":
        event.preventDefault();
        event.stopPropagation();
        selectResult();
        break;
    }
  }

  // Toggle search visibility
  function toggleSearch() {
    // Prevent rapid toggling
    if (isToggling) return;

    isToggling = true;

    // Simple state check - just use the boolean variable
    if (searchVisible) {
      hideSearch();
    } else {
      showSearch();
    }

    // Reset toggle lock after a short delay
    setTimeout(() => {
      isToggling = false;
    }, 100);
  }

  // Reset search state completely
  function resetSearchState() {
    searchInput.value = "";
    searchResults.innerHTML = "";
    resultsAvailable = false;

    // Clear any selected results
    const selected = searchResults.querySelector(".bg-blue-50");
    if (selected) {
      selected.classList.remove("bg-blue-50", "dark:bg-blue-900");
    }
  }

  // Show search
  function showSearch() {
    // Prevent multiple rapid calls
    if (searchVisible) return;

    searchVisible = true;

    // Use direct style manipulation for reliability
    fastSearch.style.display = "flex";
    fastSearch.style.visibility = "visible";
    fastSearch.style.opacity = "1";

    // Also update classes for CSS transitions
    fastSearch.classList.remove("opacity-0", "invisible");
    fastSearch.classList.add("opacity-100", "visible");

    // Clear any previous state
    resetSearchState();

    // Ensure focus is set after the element becomes visible
    setTimeout(() => {
      searchInput.focus();
      // Select all text in the input for easy replacement
      searchInput.select();
      // Add a subtle scale animation
      searchInput.style.transform = "scale(1.02)";
      setTimeout(() => {
        searchInput.style.transform = "scale(1)";
      }, 150);
    }, 100);

    if (firstRun) {
      loadSearchIndex();
      firstRun = false;
    }
  }

  // Hide search
  function hideSearch() {
    // Prevent multiple rapid calls
    if (!searchVisible) return;

    searchVisible = false;

    // Use direct style manipulation for reliability
    fastSearch.style.display = "none";
    fastSearch.style.visibility = "hidden";
    fastSearch.style.opacity = "0";

    // Also update classes for CSS transitions
    fastSearch.classList.remove("opacity-100", "visible");
    fastSearch.classList.add("opacity-0", "invisible");

    // Reset all state
    resetSearchState();

    // Remove focus from search input to prevent keyboard events from interfering
    searchInput.blur();
  }

  // Navigate through results
  function navigateResults(direction) {
    if (!resultsAvailable) return;

    const results = searchResults.querySelectorAll("li");
    const current = searchResults.querySelector(".bg-blue-50");

    if (!current) {
      if (results.length > 0) {
        results[0].classList.add("bg-blue-50", "dark:bg-blue-900");
      }
      return;
    }

    const currentIndex = Array.from(results).indexOf(current);
    const newIndex = currentIndex + direction;

    if (newIndex >= 0 && newIndex < results.length) {
      current.classList.remove("bg-blue-50", "dark:bg-blue-900");
      results[newIndex].classList.add("bg-blue-50", "dark:bg-blue-900");
    }
  }

  // Select and navigate to result
  function selectResult() {
    const selected = searchResults.querySelector(".bg-blue-50");
    if (selected) {
      const link = selected.querySelector("a");
      if (link) {
        // Hide search before navigating
        hideSearch();
        window.location.href = link.href;
      }
    } else if (resultsAvailable) {
      // If no result is selected but there are results, select the first one
      const firstResult = searchResults.querySelector("li");
      if (firstResult) {
        const link = firstResult.querySelector("a");
        if (link) {
          // Hide search before navigating
          hideSearch();
          window.location.href = link.href;
        }
      }
    }
  }

  // Perform search with weighted scoring
  function performSearch(query) {
    if (!searchIndex || query.length < CONFIG.search.minChars) {
      searchResults.innerHTML = "";
      resultsAvailable = false;
      return;
    }

    // Calculate scores for all items and filter/sort by score
    const results = searchIndex
      .map((item) => ({
        ...item,
        score: calculateSearchScore(item, query),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score) // Sort by score descending
      .slice(0, CONFIG.search.maxResults);

    displayResults(results, query);
  }

  // Display search results
  function displayResults(results, query) {
    if (results.length === 0) {
      searchResults.innerHTML = `
        <li class="px-6 py-8 text-center">
          <div class="text-gray-500 dark:text-gray-400">
            <svg class="mx-auto h-12 w-12 mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <p class="text-sm font-medium">No results found</p>
            <p class="text-xs mt-1 opacity-75">Try different keywords or check your spelling</p>
          </div>
        </li>
      `;
      resultsAvailable = false;
      return;
    }

    const html = results
      .map((item, index) => {
        const title = highlightMatch(item.title, query);
        const desc = item.desc
          ? highlightMatch(item.desc.substring(0, 120) + "...", query)
          : "";
        const section = item.section
          ? `<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">${item.section}</span>`
          : "";
        const date = item.date
          ? `<span class="text-xs text-gray-500 dark:text-gray-400">${formatDate(item.date)}</span>`
          : "";

        return `
          <li class="border-b border-gray-200 last:border-b-0 dark:border-gray-600 search-result-item" style="animation-delay: ${index * 50}ms">
            <a href="${item.permalink}" class="group block px-6 py-5 text-inherit no-underline transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-sm">
              <div class="flex items-start justify-between mb-2">
                <div class="font-semibold text-lg leading-tight text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">${title}</div>
                <div class="flex items-center gap-2 ml-3">
                  ${section}
                </div>
              </div>
              ${desc ? `<div class="text-sm text-gray-600 mb-3 leading-relaxed dark:text-gray-300">${desc}</div>` : ""}
              <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div class="flex items-center gap-3">
                  ${date}
                  <span class="text-gray-300 dark:text-gray-600">•</span>
                  <span class="capitalize">${item.type}</span>
                </div>
                <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                  </svg>
                </div>
              </div>
            </a>
          </li>
        `;
      })
      .join("");

    searchResults.innerHTML = html;
    resultsAvailable = true;

    // Add click handlers to result links to hide search when clicked
    const resultLinks = searchResults.querySelectorAll("a");
    resultLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault(); // Prevent default navigation first
        hideSearch();
        // Navigate after hiding
        setTimeout(() => {
          window.location.href = link.href;
        }, 100);
      });
    });

    // Add staggered animation to results
    const resultItems = searchResults.querySelectorAll(".search-result-item");
    resultItems.forEach((item, index) => {
      item.style.opacity = "0";
      item.style.transform = "translateY(10px)";
      setTimeout(() => {
        item.style.transition = "all 0.3s ease-out";
        item.style.opacity = "1";
        item.style.transform = "translateY(0)";
      }, index * 50);
    });
  }

  // Enhanced highlighting with better visual feedback
  function highlightMatch(text, query) {
    if (!query) return text;

    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    return text.replace(
      regex,
      '<mark class="bg-gradient-to-r from-yellow-200 to-yellow-300 text-yellow-900 px-1.5 py-0.5 rounded-md font-semibold shadow-sm dark:from-yellow-800 dark:to-yellow-900 dark:text-yellow-100 animate-pulse">$1</mark>'
    );
  }

  // Format date for better readability
  function formatDate(dateString) {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;
      if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
      if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return dateString;
    }
  }

  // Deep merge configuration objects
  function mergeConfigs(defaultConfig, userConfig) {
    const result = { ...defaultConfig };

    for (const key in userConfig) {
      if (
        userConfig[key] &&
        typeof userConfig[key] === "object" &&
        !Array.isArray(userConfig[key])
      ) {
        result[key] = mergeConfigs(defaultConfig[key] || {}, userConfig[key]);
      } else {
        result[key] = userConfig[key];
      }
    }

    return result;
  }

  // Event listeners
  searchInput.addEventListener("input", (e) => {
    performSearch(e.target.value);
  });

  searchInput.addEventListener("keydown", handleKeyDown);

  // Add global keyboard listener for shortcuts
  document.addEventListener("keydown", handleKeyDown);

  // Close search when clicking outside
  document.addEventListener("click", (e) => {
    if (searchVisible && !fastSearch.contains(e.target)) {
      hideSearch();
    }
  });

  // Focus management - ensure search input stays focused when search is open
  searchInput.addEventListener("blur", (e) => {
    if (searchVisible) {
      // Only refocus if the blur is not caused by clicking on search results or closing the search
      setTimeout(() => {
        if (searchVisible && !fastSearch.contains(document.activeElement)) {
          // Check if the search is still visible and not being closed
          if (!fastSearch.classList.contains("invisible")) {
            searchInput.focus();
          }
        }
      }, 0);
    }
  });

  // Initialize search on page load
  if (searchInput) {
    loadSearchIndex();
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => initSearch());
} else {
  initSearch();
}
