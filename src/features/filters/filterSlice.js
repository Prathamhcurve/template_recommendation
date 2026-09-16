import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import filterService from "./filterService";

// Fetch all filters
export const fetchFilters = createAsyncThunk(
  "filters/fetchAll",
  async (_, thunkAPI) => {
    try {
      return await filterService.fetchFilters();
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  },
);

const initialState = {
  filters: {
    clients: [],
    industry_tag1: [],
    industry_tag2: [],
    industry_tag3: [],
    keywords: [],
    marketing_goals: [], // Holds options returned from DB
  },
  selected: {
    clients: [],
    industry_tag1: [],
    industry_tag2: [],
    industry_tag3: [],
    keywords: [],
    marketing_goals: [], // Holds user selections
  },
  searchQuery: null,
  enabled: false,
  loading: false,
  error: null,
};

const filterSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {
    setSelectedClients: (state, action) => {
      state.selected.clients = action.payload;
    },
    setSelectedIndustryTags1: (state, action) => {
      state.selected.industry_tag1 = action.payload;
    },
    setSelectedIndustryTags2: (state, action) => {
      state.selected.industry_tag2 = action.payload;
    },
    setSelectedIndustryTags3: (state, action) => {
      state.selected.industry_tag3 = action.payload;
    },
    setSelectedKeywords: (state, action) => {
      state.selected.keywords = action.payload;
    },
    setSelectedMarketingGoals: (state, action) => {
      state.selected.marketing_goals = action.payload;
    },
    setParams: (state, action) => {
      if (!state.params) state.params = {};
      state.params.agency = action.payload.agency;
      state.params.client = action.payload.client;
    },
    setCampaignID: (state, action) => {
      state.campaignID = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    enableFilters: (state, action) => {
      state.enabled = action.payload;
    },
    resetFilters: (state) => {
      state.selected = initialState.selected;
    },
  },

  extraReducers: (builder) => {
    builder
      // FETCH ALL FILTERS
      .addCase(fetchFilters.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFilters.fulfilled, (state, action) => {
        state.loading = false;
        
        // Handles both direct payload and nested response objects safely
        const data = action.payload?.data || action.payload || {};

        state.filters.clients = data.clients || [];
        state.filters.industry_tag1 = data.industry_tag1 || [];
        state.filters.industry_tag2 = data.industry_tag2 || [];
        state.filters.industry_tag3 = data.industry_tag3 || [];
        state.filters.keywords = data.keywords || [];
        state.filters.marketing_goals = data.marketing_goals || []; // Safely populates meta_tags array
      })
      .addCase(fetchFilters.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSelectedClients,
  setSelectedIndustryTags1,
  setSelectedIndustryTags2,
  setSelectedIndustryTags3,
  setSelectedKeywords,
  setSelectedMarketingGoals,
  setParams,
  setCampaignID,
  setSearchQuery,
  enableFilters,
  resetFilters,
} = filterSlice.actions;

export default filterSlice.reducer;