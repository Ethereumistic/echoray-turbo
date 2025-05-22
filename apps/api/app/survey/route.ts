import { auth } from '@clerk/nextjs';
import { getAuth } from '@clerk/nextjs/server';
import { database } from "@repo/database";
import { 
  corsResponse, 
  corsErrorResponse, 
  handleOptionsRequest, 
  getOriginFromRequest 
} from '../utils/cors';

// Handle OPTIONS requests for CORS preflight
export async function OPTIONS(request: Request) {
  return handleOptionsRequest(request);
}

// POST endpoint to submit survey data
export async function POST(request: Request) {
  try {
    const origin = getOriginFromRequest(request);
    
    // Parse the JSON request body first to get any userId in the request
    let surveyData;
    try {
      surveyData = await request.json();
      console.log("Received survey data:", surveyData);
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return corsErrorResponse({
        error: 'Invalid JSON in request body'
      }, { status: 400, origin });
    }
    
    // Try to get the user ID in different ways
    let userId = null;
    
    // First check if the request includes a userId (highest priority)
    if (surveyData.userId && typeof surveyData.userId === 'string' && surveyData.userId.startsWith('user_')) {
      console.log("Using userId from request body:", surveyData.userId);
      userId = surveyData.userId;
    } else {
      // If not in request, try Clerk auth
      try {
        // First attempt: Use auth() function
        const authResult = auth();
        userId = authResult?.userId;
        console.log("Auth result:", { userId: userId || 'none' });
      } catch (authError) {
        console.error("Error with auth():", authError);
      }
      
      // Second attempt: Try getAuth if auth() failed
      if (!userId) {
        try {
          const authResult = getAuth(request);
          userId = authResult?.userId;
          console.log("getAuth result:", { userId: userId || 'none' });
        } catch (userError) {
          console.error("Error with getAuth():", userError);
        }
      }
    }
    
    // Require a user ID for submissions
    if (!userId) {
      console.error("No valid userId found for survey submission");
      return corsErrorResponse({
        error: 'Authentication required. Please sign in to submit your survey.'
      }, { status: 401, origin });
    }
    
    // Validate the survey data
    if (!surveyData || typeof surveyData !== 'object') {
      return corsErrorResponse({
        error: 'Invalid survey data format'
      }, { status: 400, origin });
    }
    
    // Validate required fields
    if (!Array.isArray(surveyData.surveyType) || surveyData.surveyType.length === 0) {
      console.error("Missing or invalid surveyType:", surveyData.surveyType);
      return corsErrorResponse({
        error: 'Survey type is required'
      }, { status: 400, origin });
    }
    
    // Prepare data to save to database
    const dataToSave = {
      userId,
      surveyType: surveyData.surveyType,
      projectPurpose: surveyData.projectPurpose || null,
      features: Array.isArray(surveyData.features) ? surveyData.features : [],
      priorities: Array.isArray(surveyData.priorities) ? surveyData.priorities : [],
      businessGoals: surveyData.businessGoals || null,
      competitors: Array.isArray(surveyData.competitors) ? surveyData.competitors : [],
      timeline: surveyData.timeline || null,
      budget: surveyData.budget || null,
      additionalInfo: surveyData.additionalInfo || null
    };
    
    // Log the submission
    console.log('Processing survey submission:', {
      userId,
      surveyType: dataToSave.surveyType,
      hasProjectPurpose: Boolean(dataToSave.projectPurpose),
      featuresCount: dataToSave.features.length,
      prioritiesCount: dataToSave.priorities.length,
      hasBusinessGoals: Boolean(dataToSave.businessGoals),
      hasCompetitors: dataToSave.competitors.length > 0,
      hasTimeline: Boolean(dataToSave.timeline),
      hasBudget: Boolean(dataToSave.budget),
      hasAdditionalInfo: Boolean(dataToSave.additionalInfo)
    });
    
    // Save the survey data to the database
    try {
      const surveyResponse = await database.surveyResponse.create({
        data: dataToSave
      });
      
      console.log('Survey saved to database with ID:', surveyResponse.id);
      
      // Return success response with the database ID
      return corsResponse({
        success: true,
        message: 'Survey submitted successfully',
        userId: userId,
        surveyType: dataToSave.surveyType,
        surveyId: surveyResponse.id
      }, { origin });
    } catch (dbError) {
      console.error('Database error saving survey:', dbError);
      return corsErrorResponse({
        error: 'Failed to save survey to database',
        errorDetails: dbError instanceof Error ? dbError.message : String(dbError)
      }, { status: 500, origin });
    }
  } catch (error) {
    console.error('Survey submission error:', error);
    return corsErrorResponse({
      error: 'Failed to process survey submission',
      errorDetails: error instanceof Error ? error.message : String(error)
    }, { status: 500, origin: getOriginFromRequest(request) });
  }
} 