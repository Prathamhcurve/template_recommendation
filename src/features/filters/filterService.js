const apiURL = "https://selfserve.hockeycurve.com/public/hcgallery";

const fetchFilters = async () => {
  try {
    const res = await fetch(`${apiURL}/filters`, {
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch filters: ${res.status} ${res.statusText}`);
    }

    const responseData = await res.json();
    
    // Returns { clients: [], industry_tag1: [], keywords: [], marketing_goals: [] }
    return responseData.data || responseData;
  } catch (error) {
    console.error("Error in fetchFilters service:", error);
    throw error;
  }
};

const filterService = {
  fetchFilters,
};

export default filterService;