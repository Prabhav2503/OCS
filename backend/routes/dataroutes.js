import express from "express";
import supabase from "../supabase.js";
import { validationResult } from "express-validator";

import {
  profileCreationValidator,
  registerClientValidator,
  applicationSubmissionValidator,
} from "../validators/registerclient.js";

const router = express.Router();

router.post("/register", registerClientValidator, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {role:userrole} = req.user;
  if (userrole !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Only admin can register new users" });
  } 
  const { userid, role, password } = req.body;
  const { data, error } = await supabase
    .from("users")
    .insert([{ userid, role, password_hash: password }])
    .select("userid,role")
    .single();

  if (error) {
    return res.status(500).json(error);
  }

  return res
    .status(200)
    .json({ message: "User registered successfully", data });
});

//to create profile
router.post("/create-profile", profileCreationValidator, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { userid, role } = req.user;

  if (role === "student") {
    return res
      .status(403)
      .json({ message: "Forbidden: Students cannot create profiles" });
  }

  const { profile_code, company_name, designation } = req.body;

  // Decide recruiter_email based on role
  let recruiter_email;

  if (role === "admin") {
    recruiter_email = req.body.recruiter_email;

    if (!recruiter_email) {
      return res.status(400).json({
        message: "recruiter_email is required for admin",
      });
    }
  } else if (role === "recruiter") {
    recruiter_email = userid;
  }

  try {
    const { data, error } = await supabase
      .from("profile")
      .insert([
        {
          profile_code,
          recruiter_email,
          company_name,
          designation,
        },
      ])
      .select("*")
      .single();

    if (error) {
      return res.status(500).json({
        message: "Error creating profile",
        error: error.message,
      });
    }

    return res.status(200).json({
      message: "Profile created successfully",
      data,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
});


// to get all profiles
//if profile is accepted → return only accepted profiles
//else if profile is selected → return only selected profiles
//else → return all profiles
router.get("/profiles", async (req, res) => {
  const { userid, role } = req.user;

  if (role !== "student") {
    return res
      .status(403)
      .json({ message: "Forbidden: Only students can access profiles" });
  }

  try {
    const { data: applications, error: appError } = await supabase
      .from("application")
      .select("profile_code, status")
      .eq("entry_number", userid)
      .in("status", ["Selected", "Accepted"]);

    if (appError) {
      return res.status(500).json({
        message: "Error fetching application status",
        error: appError.message,
      });
    }

    /* Accepted exists → return only Accepted profiles */
    const acceptedProfiles = applications.filter(
      (app) => app.status === "Accepted"
    );

    if (acceptedProfiles.length > 0) {
      const profileCodes = acceptedProfiles.map((a) => a.profile_code);

      const { data, error } = await supabase
        .from("profile")
        .select("*")
        .in("profile_code", profileCodes);

      if (error) {
        return res.status(500).json({
          message: "Error fetching accepted profiles",
          error: error.message,
        });
      }

      return res.status(200).json({
        status: "Accepted",
        data,
      });
    }

    /* Selected exists → return only Selected profiles */
    const selectedProfiles = applications.filter(
      (app) => app.status === "Selected"
    );

    if (selectedProfiles.length > 0) {
      const profileCodes = selectedProfiles.map((a) => a.profile_code);

      const { data, error } = await supabase
        .from("profile")
        .select("*")
        .in("profile_code", profileCodes);

      if (error) {
        return res.status(500).json({
          message: "Error fetching selected profiles",
          error: error.message,
        });
      }

      return res.status(200).json({
        status: "Selected",
        data,
      });
    }

    /* Else → return all profiles EXCEPT accepted ones */
    const acceptedProfileCodes = acceptedProfiles.map(
      (a) => a.profile_code
    );

    let query = supabase.from("profile").select("*");

    if (acceptedProfileCodes.length > 0) {
      query = query.not(
        "profile_code",
        "in",
        `(${acceptedProfileCodes.join(",")})`
      );
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({
        message: "Error fetching all profiles",
        error: error.message,
      });
    }

    return res.status(200).json({
      status: "All",
      data,
    });

  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
});


//apply to profile with given code
router.post("/profile/:code", async (req, res) => {
  const { userid, role } = req.user;
  const profile_code = req.params.code;

  if (role !== "student") {
    return res
      .status(403)
      .json({ message: "Forbidden: Only students can access profile details" });
  }

  try {
    /* Check profile exists */
    const { data: profile, error: profileError } = await supabase
      .from("profile")
      .select("profile_code")
      .eq("profile_code", profile_code)
      .single();

    if (profileError) {
      return res.status(400).json({ message: "Invalid Profile Code" });
    }

    /* Check if already applied (Applied or Selected) */
    const { data: existingApp, error: checkError } = await supabase
      .from("application")
      .select("status")
      .eq("profile_code", profile_code)
      .eq("entry_number", userid)
      .in("status", ["Applied", "Selected"])
      .maybeSingle();

    if (checkError) {
      return res.status(500).json({
        message: "Error checking application status",
        error: checkError.message,
      });
    }

    if (existingApp) {
      return res.status(409).json({
        message: "Already applied to this profile",
        status: existingApp.status,
      });
    }

    /* Insert new application */
    const { data: appdata, error: appError } = await supabase
      .from("application")
      .insert([
        {
          entry_number: userid,
          profile_code: profile_code,
          status: "Applied",
        },
      ])
      .select("*")
      .single();

    if (appError) {
      return res.status(500).json({
        message: "Error applying to profile",
        error: appError.message,
      });
    }

    return res.status(200).json({
      message: "Applied to profile successfully",
      data: appdata,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
});

//change application status to Selected/Not Selected/Rejected 
router.post("/profile/application/change-status",
  applicationSubmissionValidator,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userid, role } = req.user;
    const { profile_code, status,entry_number } = req.body;
    if (role === "student") {
      return res.status(403).json({
        message: "Forbidden: Students cannot change application status",
      });
    } else if (status === "Accepted") {
      return res.status(403).json({
        message: "Forbidden: You Cannot change status to Accepted",
      });
    }
    try {
      const { data, error } = await supabase
        .from("application")
        .update({ status: status })
        .eq("profile_code", profile_code)
        .eq("entry_number", entry_number)
        .select("*")
        .single();

      if (error) {
        return res.status(500).json({
          message: "Application do not exist",
          error: error.message,
        });
      }

      return res
        .status(200)
        .json({ message: "Application status updated successfully", data });
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Internal Server Error", error: err.message });
    }
  },
);

//student can accept or reject offer
router.post("/profile/application/accept",
  applicationSubmissionValidator,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userid, role } = req.user;
    const { profile_code, status } = req.body;

    if (role !== "student") {
      return res.status(403).json({
        message: "Forbidden: Only students can accept application status",
      });
    }

    if (status !== "Accepted" && status !== "Rejected") {
      return res.status(403).json({
        message:
          "Forbidden: You can only change status to Accepted or Rejected",
      });
    }

    try {
      /*  Fetch existing application */
      const { data: application, error: fetchError } = await supabase
        .from("application")
        .select("status")
        .eq("profile_code", profile_code)
        .eq("entry_number", userid)
        .single();

      if (fetchError || !application) {
        return res.status(404).json({
          message: "Application does not exist",
        });
      }

      /* Allow update only if current status is Selected */
      if (application.status !== "Selected") {
        return res.status(400).json({
          message: "Application is not selected yet",
          currentStatus: application.status,
        });
      }

      if(application.status === "Rejected"){
        return res.status(400).json({
          message: "Application is already rejected",
          currentStatus: application.status,
        });
      }

      /* Update status */
      const { data, error } = await supabase
        .from("application")
        .update({ status })
        .eq("profile_code", profile_code)
        .eq("entry_number", userid)
        .select("*")
        .single();

      if (error) {
        return res.status(500).json({
          message: "Failed to update application status",
          error: error.message,
        });
      }

      return res.status(200).json({
        message: "Application status updated successfully",
        data,
      });
    } catch (err) {
      return res.status(500).json({
        message: "Internal Server Error",
        error: err.message,
      });
    }
  }
);


router.post("/user/me", async (req, res) => {
  const { userid, role } = req.user;

  try {
    if (role === "student") {
      const { data: appdata, error: apperror } = await supabase
        .from("application")
        .select("profile_code, status")
        .eq("entry_number", userid);

      if (apperror) {
        return res.status(500).json({
          message: "Error fetching student data",
          error: apperror.message,
        });
      }

      if (!appdata || appdata.length === 0) {
        return res.status(200).json({
          message: "No applications found",
          data: [],
        });
      }

      const profileCodes = appdata.map((a) => a.profile_code);

      const { data: profiledata, error: profileerror } = await supabase
        .from("profile")
        .select("profile_code, recruiter_email, company_name, designation")
        .in("profile_code", profileCodes);

      if (profileerror) {
        return res.status(500).json({
          message: "Error fetching profile data",
          error: profileerror.message,
        });
      }

      /*  Merge application + profile data */
      const profileMap = new Map(profiledata.map((p) => [p.profile_code, p]));

      const mergedData = appdata.map((app) => {
        const profile = profileMap.get(app.profile_code);

        return {
          profile_code: app.profile_code,
          recruiter_email: profile?.recruiter_email || null,
          company_name: profile?.company_name || null,
          designation: profile?.designation || null,
          status: app.status,
        };
      });

      return res.status(200).json({
        message: "User data fetched successfully",
        data: mergedData,
      });
    } 
    else if(role === "recruiter") {
      /*  Get recruiter profiles */
      const { data: profiledata, error: profileerror } = await supabase
        .from("profile")
        .select("*")
        .eq("recruiter_email", userid);

      if (profileerror) {
        return res.status(500).json({
          message: "Error fetching recruiter data",
          error: profileerror.message,
        });
      }

      if (!profiledata || profiledata.length === 0) {
        return res.status(200).json({
          message: "No profiles found",
          data: [],
        });
      }

      /*  Get applications for those profiles */
      const profileCodes = profiledata.map((p) => p.profile_code);

      const { data: appdata, error: apperror } = await supabase
        .from("application")
        .select("profile_code, entry_number, status")
        .in("profile_code",profileCodes);

      if (apperror) {
        return res.status(500).json({
          message: "Error fetching application data",
          error: apperror.message,
        });
      }

      /*  Build applicants map */
      const applicantsMap = {};

      appdata.forEach((app) => {
        if (!applicantsMap[app.profile_code]) {
          applicantsMap[app.profile_code] = [];
        }
        applicantsMap[app.profile_code].push({
          entry_number: app.entry_number,
          status: app.status
        });
      });

      /*  Attach applicants to each profile */
      const mergedData = profiledata.map((profile) => ({
        ...profile,
        applicants: applicantsMap[profile.profile_code] || [],
      }));

      return res.status(200).json({
        message: "User data fetched successfully",
        data: mergedData,
      });
    } 
    else {
      const { data: profiledata, error: profileerror } = await supabase
        .from("profile")
        .select("*")
    
     if (profileerror) {
        return res.status(500).json({
          message: "Error fetching recruiter data",
          error: profileerror.message,
        });
      }

      if (!profiledata || profiledata.length === 0) {
        return res.status(200).json({
          message: "No profiles found",
          data: [],
        });
      }

       const { data: appdata, error: apperror } = await supabase
        .from("application")
        .select("*");

      if (apperror) {
        return res.status(500).json({
          message: "Error fetching application data",
          error: apperror.message,
        });
      }
       const applicantsMap = {};

      appdata.forEach((app) => {
        if (!applicantsMap[app.profile_code]) {
          applicantsMap[app.profile_code] = [];
        }
        applicantsMap[app.profile_code].push({
          entry_number: app.entry_number,
          status: app.status
        });
      });

      /*  Attach applicants to each profile */
      const mergedData = profiledata.map((profile) => ({
        ...profile,
        applicants: applicantsMap[profile.profile_code] || [],
      }));

      return res.status(200).json({
        message: "User data fetched successfully",
        data: mergedData,
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: err.message,
    });
  }
});

export default router;
