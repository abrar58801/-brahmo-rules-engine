import { supabase } from './supabase';

export async function setupDatabase() {
  console.log('🔧 Checking database setup...');
  
  try {
    // First, test if we can query the users table
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (testError) {
      console.error('❌ Database query failed:', testError);
      
      // If table doesn't exist, tell user to create it
      if (testError.code === '42P01') {
        console.warn('⚠️ Tables not found. Please create them in Supabase SQL Editor.');
        return { success: false, error: 'Tables not found. Please run the CREATE TABLE SQL in Supabase.' };
      }
      
      return { success: false, error: testError.message };
    }
    
    // Check if data exists
    const { count, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('❌ Count query failed:', countError);
      return { success: false, error: countError.message };
    }
    
    if ((count || 0) === 0) {
      console.log('🌱 No data found. Seeding data...');
      await seedData();
    } else {
      console.log('✅ Data already exists. Skipping seed.');
    }
    
    console.log('✅ Database ready!');
    return { success: true };
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    return { success: false, error: String(error) };
  }
}


async function checkDataExists(): Promise<boolean> {
  try {
    const { count, error } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (error) return false;
    return (count || 0) > 0;
  } catch (error) {
    return false;
  }
}

async function seedData() {
  console.log('🌱 Seeding data...');
  
  // Seed organization
  await seedOrganization();
  
  // Seed hierarchy levels
  await seedHierarchy();
  
  // Seed users
  await seedUsers();
  
  // Seed knowledge nodes
  await seedNodes();
  
  // Seed edges
  await seedEdges();
}

async function seedOrganization() {
  const { error } = await supabase
    .from('organizations')
    .upsert({
      id: 'supra',
      name: 'Supra Multi-Specialty Hospital',
      segment: 'hospital',
      config: { derivability_threshold: 0.7, max_candidate_set: 50 }
    }, { onConflict: 'id' });
  
  if (error) console.error('Organization seed error:', error);
}

async function seedHierarchy() {
  const hierarchyLevels = [
    { id: 'HL-01', org_id: 'supra', level_number: 1, level_name: 'Hospital', department: null, parent_ids: [], zone: 1 },
    { id: 'HL-03-CLIN', org_id: 'supra', level_number: 3, level_name: 'Clinical Division', department: null, parent_ids: ['HL-01'], zone: 1 },
    { id: 'HL-03-ADMIN', org_id: 'supra', level_number: 3, level_name: 'Administrative Division', department: null, parent_ids: ['HL-01'], zone: 1 },
    { id: 'HL-05-ORTHO', org_id: 'supra', level_number: 5, level_name: 'Orthopaedics Department', department: 'ortho', parent_ids: ['HL-03-CLIN'], zone: 1 },
    { id: 'HL-05-MED', org_id: 'supra', level_number: 5, level_name: 'General Medicine Department', department: 'medicine', parent_ids: ['HL-03-CLIN'], zone: 1 },
    { id: 'HL-05-CARDIO', org_id: 'supra', level_number: 5, level_name: 'Cardiology Department', department: 'cardiology', parent_ids: ['HL-03-CLIN'], zone: 1 },
    { id: 'HL-05-PAEDS', org_id: 'supra', level_number: 5, level_name: 'Paediatrics Department', department: 'paediatrics', parent_ids: ['HL-03-CLIN'], zone: 1 },
    { id: 'HL-05-SURG', org_id: 'supra', level_number: 5, level_name: 'Surgery Department', department: 'surgery', parent_ids: ['HL-03-CLIN'], zone: 1 },
    { id: 'HL-05-ICU', org_id: 'supra', level_number: 5, level_name: 'ICU Department', department: 'icu', parent_ids: ['HL-03-CLIN'], zone: 1 },
    { id: 'HL-10-ORTHO-W', org_id: 'supra', level_number: 10, level_name: 'Ortho Ward', department: 'ortho', parent_ids: ['HL-05-ORTHO'], zone: 1 },
    { id: 'HL-10-MED-W', org_id: 'supra', level_number: 10, level_name: 'Medicine Ward', department: 'medicine', parent_ids: ['HL-05-MED'], zone: 1 },
    { id: 'HL-10-PAEDS-W', org_id: 'supra', level_number: 10, level_name: 'Paediatrics Ward', department: 'paediatrics', parent_ids: ['HL-05-PAEDS'], zone: 1 },
    { id: 'HL-GLOBAL', org_id: 'supra', level_number: 3, level_name: 'Global Constraints', department: null, parent_ids: ['HL-01'], zone: 2 }
  ];
  
  for (const level of hierarchyLevels) {
    const { error } = await supabase
      .from('hierarchy_levels')
      .upsert(level, { onConflict: 'id' });
    
    if (error) console.error('Hierarchy seed error:', error);
  }
}

async function seedUsers() {
  const users = [
    { id: 'U-PRIYA', org_id: 'supra', name: 'Nurse Priya', role: 'VIEWER', department: 'ortho', ceiling_level: 10, write_ceiling: null, compliance_clearance: [] },
    { id: 'U-VIKRAM', org_id: 'supra', name: 'Dr. Vikram (HOD)', role: 'HOD', department: 'ortho', ceiling_level: 4, write_ceiling: 4, compliance_clearance: [] },
    { id: 'U-ANANYA', org_id: 'supra', name: 'Dr. Ananya', role: 'EDITOR', department: 'medicine', ceiling_level: 8, write_ceiling: 8, compliance_clearance: [] },
    { id: 'U-SHARMA', org_id: 'supra', name: 'Dr. Sharma (HOD)', role: 'HOD', department: 'medicine', ceiling_level: 4, write_ceiling: 4, compliance_clearance: [] },
    { id: 'U-RAVI', org_id: 'supra', name: 'Pharmacist Ravi', role: 'VIEWER', department: 'pharmacy', ceiling_level: 12, write_ceiling: null, compliance_clearance: [] },
    { id: 'U-SUNITA', org_id: 'supra', name: 'Dr. Sunita (QA)', role: 'QUALITY', department: 'quality', ceiling_level: 6, write_ceiling: 8, compliance_clearance: ['MNPI'] },
    { id: 'U-SURESH', org_id: 'supra', name: 'Admin Suresh', role: 'ADMIN', department: 'admin', ceiling_level: 1, write_ceiling: 1, compliance_clearance: ['MNPI', 'PHI', 'CONFIDENTIAL'] }
  ];
  
  for (const user of users) {
    const { error } = await supabase
      .from('users')
      .upsert(user, { onConflict: 'id' });
    
    if (error) console.error('User seed error:', error);
  }
}

async function seedNodes() {
  const nodes = [
    // Global nodes
    { id: 'N-G01', org_id: 'supra', hierarchy_level_id: 'HL-GLOBAL', type: 'CONSTRAINT', title: 'Warfarin-NSAID Interaction', content: 'CRITICAL: Never prescribe NSAIDs to patients on Warfarin. Risk of life-threatening GI bleed.', importance: 0.98, zone: 2, status: 'ACTIVE', derivability_score: 0.15, compliance_tags: [], department: null },
    { id: 'N-G02', org_id: 'supra', hierarchy_level_id: 'HL-GLOBAL', type: 'CONSTRAINT', title: 'Penicillin Allergy Cross-Reactivity', content: 'Patients with documented penicillin allergy: 10% cross-reactivity with 1st-gen cephalosporins.', importance: 0.95, zone: 2, status: 'ACTIVE', derivability_score: 0.20, compliance_tags: [], department: null },
    { id: 'N-G03', org_id: 'supra', hierarchy_level_id: 'HL-GLOBAL', type: 'CONSTRAINT', title: 'Blood Transfusion Two-Person Verification', content: 'ALL blood transfusions require two-person verification of patient identity and blood type.', importance: 0.97, zone: 2, status: 'ACTIVE', derivability_score: 0.10, compliance_tags: [], department: null },
    { id: 'N-G04', org_id: 'supra', hierarchy_level_id: 'HL-GLOBAL', type: 'CONSTRAINT', title: 'Hand Hygiene 5-Moment Compliance', content: 'WHO 5-moment hand hygiene compliance is mandatory. Target: 95%.', importance: 0.90, zone: 2, status: 'ACTIVE', derivability_score: 0.75, compliance_tags: [], department: null },
    { id: 'N-G05', org_id: 'supra', hierarchy_level_id: 'HL-GLOBAL', type: 'ANTI_PATTERN', title: 'Verbal Orders Without Documentation', content: 'NEVER accept verbal orders without written confirmation within 1 hour.', importance: 0.92, zone: 2, status: 'ACTIVE', derivability_score: 0.12, compliance_tags: [], department: null },
    
    // Ortho nodes
    { id: 'N-O01', org_id: 'supra', hierarchy_level_id: 'HL-05-ORTHO', type: 'CONSTRAINT', title: 'Post-Op Vitals Monitoring', content: 'Post-operative vitals q15min for 4 hours, then hourly for 24 hours.', importance: 0.94, zone: 1, status: 'ACTIVE', derivability_score: 0.35, compliance_tags: [], department: 'ortho' },
    { id: 'N-O02', org_id: 'supra', hierarchy_level_id: 'HL-10-ORTHO-W', type: 'DECISION', title: 'Paracetamol First-Line Post-TKR', content: 'Supra Ortho uses Paracetamol 650mg QDS as first-line post-TKR pain management.', importance: 0.88, zone: 1, status: 'ACTIVE', derivability_score: 0.08, compliance_tags: [], department: 'ortho' },
    { id: 'N-O03', org_id: 'supra', hierarchy_level_id: 'HL-10-ORTHO-W', type: 'ANTI_PATTERN', title: 'Never Discharge TKR Under 48 Hours', content: 'Do NOT discharge TKR patients before 48 hours post-op.', importance: 0.91, zone: 1, status: 'ACTIVE', derivability_score: 0.10, compliance_tags: [], department: 'ortho' },
    { id: 'N-O04', org_id: 'supra', hierarchy_level_id: 'HL-05-ORTHO', type: 'DECISION', title: 'Zimmer Implant Preference', content: 'Supra Ortho uses Zimmer Biomet as preferred TKR implant vendor.', importance: 0.72, zone: 1, status: 'ACTIVE', derivability_score: 0.05, compliance_tags: [], department: 'ortho' },
    { id: 'N-O05', org_id: 'supra', hierarchy_level_id: 'HL-10-ORTHO-W', type: 'FACT', title: 'Ortho Ward Bed Capacity', content: 'Ortho Ward: 45 beds. 12 post-surgical, 8 traction, 25 general ortho.', importance: 0.50, zone: 1, status: 'ACTIVE', derivability_score: 0.40, compliance_tags: [], department: 'ortho' },
    { id: 'N-O06', org_id: 'supra', hierarchy_level_id: 'HL-05-ORTHO', type: 'CONSTRAINT', title: 'DVT Prophylaxis Protocol', content: 'ALL ortho surgical patients receive Enoxaparin 40mg SC daily starting 12 hours post-op.', importance: 0.93, zone: 1, status: 'ACTIVE', derivability_score: 0.30, compliance_tags: [], department: 'ortho' },
    
    // HOD-level nodes (MNPI tagged)
    { id: 'N-O11', org_id: 'supra', hierarchy_level_id: 'HL-05-ORTHO', type: 'DECISION', title: 'Ortho Department Budget 2026', content: 'FY 2026 budget: ₹4.2 Cr. Implants: 45%, Staffing: 30%.', importance: 0.70, zone: 1, status: 'ACTIVE', derivability_score: 0.05, compliance_tags: ['MNPI'], department: 'ortho' },
    { id: 'N-O12', org_id: 'supra', hierarchy_level_id: 'HL-05-ORTHO', type: 'DECISION', title: 'Ortho Vendor Negotiation Strategy', content: 'Renegotiate Zimmer contract in July 2026. Target: 12% discount.', importance: 0.65, zone: 1, status: 'ACTIVE', derivability_score: 0.03, compliance_tags: ['MNPI', 'CONFIDENTIAL'], department: 'ortho' },
    
    // Medicine nodes
    { id: 'N-M01', org_id: 'supra', hierarchy_level_id: 'HL-05-MED', type: 'CONSTRAINT', title: 'Diabetic Fasting Protocol', content: 'For diabetic patients observing fasts: adjust insulin timing, NOT dose.', importance: 0.90, zone: 1, status: 'ACTIVE', derivability_score: 0.15, compliance_tags: [], department: 'medicine' },
    { id: 'N-M02', org_id: 'supra', hierarchy_level_id: 'HL-05-MED', type: 'DECISION', title: 'Sepsis Protocol v3 2026', content: 'Blood cultures before antibiotics, lactate within 1 hour, 30mL/kg crystalloid.', importance: 0.95, zone: 1, status: 'ACTIVE', derivability_score: 0.25, compliance_tags: [], department: 'medicine' },
    { id: 'N-M08', org_id: 'supra', hierarchy_level_id: 'HL-05-MED', type: 'DECISION', title: 'Sepsis Protocol v2 2024 (SUPERSEDED)', content: 'OLD: Sepsis Bundle v2 with 3-hour lactate window.', importance: 0.95, zone: 1, status: 'SUPERSEDED', derivability_score: 0.25, compliance_tags: [], department: 'medicine' },
    
    // Cardiology nodes
    { id: 'N-C01', org_id: 'supra', hierarchy_level_id: 'HL-05-CARDIO', type: 'CONSTRAINT', title: 'Cardiac Catheterization Consent', content: 'Written consent required minimum 4 hours before procedure.', importance: 0.92, zone: 1, status: 'ACTIVE', derivability_score: 0.30, compliance_tags: [], department: 'cardiology' },
    { id: 'N-C02', org_id: 'supra', hierarchy_level_id: 'HL-05-CARDIO', type: 'DECISION', title: 'CCU Troponin Protocol', content: 'Serial troponin at 0, 3, 6 hours for STEMI rule-out.', importance: 0.90, zone: 1, status: 'ACTIVE', derivability_score: 0.35, compliance_tags: [], department: 'cardiology' },
    
    // Admin nodes
    { id: 'N-A01', org_id: 'supra', hierarchy_level_id: 'HL-01', type: 'DECISION', title: 'Hospital Expansion Plan', content: '80 additional beds by Q4 2027. Investment: ₹85 Cr.', importance: 0.80, zone: 1, status: 'ACTIVE', derivability_score: 0.02, compliance_tags: ['MNPI', 'CONFIDENTIAL'], department: null },
    { id: 'N-A02', org_id: 'supra', hierarchy_level_id: 'HL-01', type: 'DECISION', title: 'Staff Salary Restructuring', content: '12% salary increase for nurses, 8% for technicians.', importance: 0.75, zone: 1, status: 'ACTIVE', derivability_score: 0.01, compliance_tags: ['MNPI', 'CONFIDENTIAL'], department: null },
    
    // High derivability nodes (should be filtered out)
    { id: 'N-D01', org_id: 'supra', hierarchy_level_id: 'HL-05-ORTHO', type: 'FACT', title: 'What is a Total Knee Replacement', content: 'TKR is a surgical procedure where damaged knee joint surfaces are replaced.', importance: 0.40, zone: 1, status: 'ACTIVE', derivability_score: 0.92, compliance_tags: [], department: 'ortho' },
    { id: 'N-D02', org_id: 'supra', hierarchy_level_id: 'HL-05-MED', type: 'FACT', title: 'Paracetamol Mechanism of Action', content: 'Paracetamol is an analgesic and antipyretic. Inhibits prostaglandin synthesis.', importance: 0.35, zone: 1, status: 'ACTIVE', derivability_score: 0.95, compliance_tags: [], department: 'medicine' },
    { id: 'N-D03', org_id: 'supra', hierarchy_level_id: 'HL-GLOBAL', type: 'FACT', title: 'Normal Vital Sign Ranges', content: 'Normal vitals: HR 60-100, BP 120/80, RR 12-20, SpO2 >95%.', importance: 0.30, zone: 1, status: 'ACTIVE', derivability_score: 0.98, compliance_tags: [], department: null }
  ];
  
  for (const node of nodes) {
    const { error } = await supabase
      .from('knowledge_nodes')
      .upsert(node, { onConflict: 'id' });
    
    if (error) console.error('Node seed error:', error);
  }
}

async function seedEdges() {
  const edges = [
    { source_id: 'N-O02', target_id: 'N-O01', edge_type: 'SUPPORTS' },
    { source_id: 'N-O06', target_id: 'N-O01', edge_type: 'SUPPORTS' },
    { source_id: 'N-G01', target_id: 'N-O01', edge_type: 'SUPPORTS' },
    { source_id: 'N-M02', target_id: 'N-M08', edge_type: 'SUPERSEDES' }
  ];
  
  for (const edge of edges) {
    const { error } = await supabase
      .from('edges')
      .upsert(edge, { onConflict: 'id' });
    
    if (error) console.error('Edge seed error:', error);
  }
}