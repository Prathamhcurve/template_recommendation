const apiURL = "https://selfserve.hockeycurve.com/public/hcgallery";

/**
 * Fetches available filter options from the backend
 */
export const fetchFilters = async () => {
  try {
    const res = await fetch(`${apiURL}/filters`, {
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch filters: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return data.data || data;
  } catch (error) {
    console.error("Error in fetchFilters service:", error);
    throw error;
  }
};

/**
 * Sends selected filters (including marketingGoals) to the backend
 */
export const filterTemplates = async (filterPayload) => {
  try {
    const res = await fetch(`${apiURL}/filterTemps`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        clients: filterPayload.clients || [],
        industryTags1: filterPayload.industryTags1 || [],
        keywords: filterPayload.keywords || [],
        marketingGoals: filterPayload.marketingGoals || [],
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to filter templates: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return data.data || data;
  } catch (error) {
    console.error("Error in filterTemplates service:", error);
    throw error;
  }
};

const filterService = {
  fetchFilters,
  filterTemplates,
};

export default filterService;