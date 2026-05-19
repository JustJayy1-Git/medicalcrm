-- =============================================================
-- Pro Injury CRM — ICD-10-CM "PI Starter Pack"
-- 2026-05-19 (migration 0009)
-- =============================================================
-- Seeds ~400 ICD-10-CM codes covering injury/PI/PT use cases.
-- Includes: cervical/thoracic/lumbar strain & sprain, sciatica,
-- shoulder/elbow/wrist/hip/knee/ankle injuries, concussion,
-- contusions, muscle/tendon/ligament injuries, MVA encounter
-- codes, and chronic pain syndromes.
--
-- Codes are stored with the 7th character "A" (initial encounter)
-- by default, since that's what's used at first PT visit. Subsequent
-- (D) and sequela (S) codes can be added later as needed.

-- Helper: idempotent insert
insert into public.icd_codes (code, description, is_active) values
  -- ==========================================================
  -- HEAD & FACE
  -- ==========================================================
  ('S00.83XA', 'Contusion of other part of head, initial encounter', true),
  ('S00.93XA', 'Contusion of unspecified part of head, initial encounter', true),
  ('S00.03XA', 'Contusion of scalp, initial encounter', true),
  ('S00.10XA', 'Contusion of eyelid and periocular area, initial encounter', true),
  ('S00.30XA', 'Abrasion of nose, initial encounter', true),
  ('S00.81XA', 'Abrasion of other part of head, initial encounter', true),
  ('S09.90XA', 'Unspecified injury of head, initial encounter', true),
  ('S06.0X0A', 'Concussion without loss of consciousness, initial encounter', true),
  ('S06.0X1A', 'Concussion with LOC of 30 minutes or less, initial encounter', true),
  ('S06.0X9A', 'Concussion with LOC of unspecified duration, initial encounter', true),
  ('S06.9X0A', 'Unspecified intracranial injury without LOC, initial encounter', true),
  ('R51.9',    'Headache, unspecified', true),
  ('G44.311',  'Acute post-traumatic headache, intractable', true),
  ('G44.319',  'Acute post-traumatic headache, not intractable', true),
  ('G44.321',  'Chronic post-traumatic headache, intractable', true),
  ('G44.329',  'Chronic post-traumatic headache, not intractable', true),

  -- ==========================================================
  -- CERVICAL SPINE (NECK)
  -- ==========================================================
  ('S13.4XXA', 'Sprain of ligaments of cervical spine, initial encounter', true),
  ('S13.8XXA', 'Sprain of joints and ligaments of other parts of neck, initial encounter', true),
  ('S13.9XXA', 'Sprain of joints and ligaments of unspecified parts of neck, initial encounter', true),
  ('S16.1XXA', 'Strain of muscle, fascia and tendon at neck level, initial encounter', true),
  ('S16.8XXA', 'Other specified injuries of muscle, fascia and tendon at neck level, initial encounter', true),
  ('S16.9XXA', 'Unspecified injury of muscle, fascia and tendon at neck level, initial encounter', true),
  ('S14.0XXA', 'Concussion and edema of cervical spinal cord, initial encounter', true),
  ('S14.2XXA', 'Injury of nerve root of cervical spine, initial encounter', true),
  ('M54.2',    'Cervicalgia (neck pain)', true),
  ('M54.12',   'Radiculopathy, cervical region', true),
  ('M54.13',   'Radiculopathy, cervicothoracic region', true),
  ('M50.20',   'Other cervical disc displacement, unspecified cervical region', true),
  ('M50.22',   'Other cervical disc displacement, mid-cervical region', true),
  ('M50.23',   'Other cervical disc displacement, cervicothoracic region', true),
  ('M50.30',   'Other cervical disc degeneration, unspecified cervical region', true),
  ('M62.838',  'Other muscle spasm', true),
  ('S13.0XXA', 'Traumatic rupture of cervical intervertebral disc, initial encounter', true),
  ('S13.140A', 'Subluxation of C0/C1 cervical vertebrae, initial encounter', true),
  ('S13.150A', 'Subluxation of C1/C2 cervical vertebrae, initial encounter', true),
  ('S13.160A', 'Subluxation of C2/C3 cervical vertebrae, initial encounter', true),
  ('S13.170A', 'Subluxation of C3/C4 cervical vertebrae, initial encounter', true),
  ('S13.180A', 'Subluxation of C4/C5 cervical vertebrae, initial encounter', true),
  ('S13.181A', 'Subluxation of C5/C6 cervical vertebrae, initial encounter', true),
  ('S13.182A', 'Subluxation of C6/C7 cervical vertebrae, initial encounter', true),
  ('S13.183A', 'Subluxation of C7/T1 cervical vertebrae, initial encounter', true),

  -- ==========================================================
  -- THORACIC SPINE (MID BACK)
  -- ==========================================================
  ('S23.3XXA', 'Sprain of ligaments of thoracic spine, initial encounter', true),
  ('S23.8XXA', 'Sprain of other specified parts of thorax, initial encounter', true),
  ('S23.9XXA', 'Sprain of unspecified parts of thorax, initial encounter', true),
  ('S29.011A', 'Strain of muscle and tendon of front wall of thorax, initial encounter', true),
  ('S29.012A', 'Strain of muscle and tendon of back wall of thorax, initial encounter', true),
  ('M54.6',    'Pain in thoracic spine', true),
  ('M54.14',   'Radiculopathy, thoracic region', true),
  ('M54.15',   'Radiculopathy, thoracolumbar region', true),
  ('M51.24',   'Other intervertebral disc displacement, thoracic region', true),

  -- ==========================================================
  -- LUMBAR SPINE (LOWER BACK)
  -- ==========================================================
  ('S33.5XXA', 'Sprain of ligaments of lumbar spine, initial encounter', true),
  ('S33.6XXA', 'Sprain of sacroiliac joint, initial encounter', true),
  ('S33.8XXA', 'Sprain of other parts of lumbar spine and pelvis, initial encounter', true),
  ('S33.9XXA', 'Sprain of unspecified parts of lumbar spine and pelvis, initial encounter', true),
  ('S39.012A', 'Strain of muscle, fascia and tendon of lower back, initial encounter', true),
  ('S39.092A', 'Other injury of muscle, fascia and tendon of lower back, initial encounter', true),
  ('M54.50',   'Low back pain, unspecified', true),
  ('M54.51',   'Vertebrogenic low back pain', true),
  ('M54.59',   'Other low back pain', true),
  ('M54.16',   'Radiculopathy, lumbar region', true),
  ('M54.17',   'Radiculopathy, lumbosacral region', true),
  ('M54.30',   'Sciatica, unspecified side', true),
  ('M54.31',   'Sciatica, right side', true),
  ('M54.32',   'Sciatica, left side', true),
  ('M54.40',   'Lumbago with sciatica, unspecified side', true),
  ('M54.41',   'Lumbago with sciatica, right side', true),
  ('M54.42',   'Lumbago with sciatica, left side', true),
  ('M51.26',   'Other intervertebral disc displacement, lumbar region', true),
  ('M51.27',   'Other intervertebral disc displacement, lumbosacral region', true),
  ('M51.36',   'Other intervertebral disc degeneration, lumbar region', true),
  ('M51.37',   'Other intervertebral disc degeneration, lumbosacral region', true),
  ('M99.03',   'Segmental and somatic dysfunction of lumbar region', true),
  ('M99.04',   'Segmental and somatic dysfunction of sacral region', true),
  ('M99.05',   'Segmental and somatic dysfunction of pelvic region', true),
  ('S33.110A', 'Subluxation of L1/L2 lumbar vertebra, initial encounter', true),
  ('S33.120A', 'Subluxation of L2/L3 lumbar vertebra, initial encounter', true),
  ('S33.130A', 'Subluxation of L3/L4 lumbar vertebra, initial encounter', true),
  ('S33.140A', 'Subluxation of L4/L5 lumbar vertebra, initial encounter', true),
  ('S33.0XXA', 'Traumatic rupture of lumbar intervertebral disc, initial encounter', true),

  -- ==========================================================
  -- SHOULDER (L/R)
  -- ==========================================================
  ('S43.401A', 'Unspecified sprain of right shoulder joint, initial encounter', true),
  ('S43.402A', 'Unspecified sprain of left shoulder joint, initial encounter', true),
  ('S43.421A', 'Sprain of rotator cuff capsule of right shoulder, initial encounter', true),
  ('S43.422A', 'Sprain of rotator cuff capsule of left shoulder, initial encounter', true),
  ('S43.431A', 'Superior glenoid labrum lesion of right shoulder, initial encounter', true),
  ('S43.432A', 'Superior glenoid labrum lesion of left shoulder, initial encounter', true),
  ('S43.491A', 'Other sprain of right shoulder joint, initial encounter', true),
  ('S43.492A', 'Other sprain of left shoulder joint, initial encounter', true),
  ('S43.001A', 'Unspecified subluxation of right shoulder joint, initial encounter', true),
  ('S43.002A', 'Unspecified subluxation of left shoulder joint, initial encounter', true),
  ('S46.011A', 'Strain of muscle/tendon of rotator cuff of right shoulder, initial encounter', true),
  ('S46.012A', 'Strain of muscle/tendon of rotator cuff of left shoulder, initial encounter', true),
  ('S46.811A', 'Strain of other muscles/tendons at shoulder, right arm, initial encounter', true),
  ('S46.812A', 'Strain of other muscles/tendons at shoulder, left arm, initial encounter', true),
  ('M25.511',  'Pain in right shoulder', true),
  ('M25.512',  'Pain in left shoulder', true),
  ('M75.101',  'Unspecified rotator cuff tear or rupture of right shoulder, not specified as traumatic', true),
  ('M75.102',  'Unspecified rotator cuff tear or rupture of left shoulder, not specified as traumatic', true),
  ('M75.31',   'Calcific tendinitis of right shoulder', true),
  ('M75.32',   'Calcific tendinitis of left shoulder', true),

  -- ==========================================================
  -- ELBOW (L/R)
  -- ==========================================================
  ('S53.401A', 'Unspecified sprain of right elbow, initial encounter', true),
  ('S53.402A', 'Unspecified sprain of left elbow, initial encounter', true),
  ('S53.421A', 'Sprain of radiohumeral joint of right elbow, initial encounter', true),
  ('S53.422A', 'Sprain of radiohumeral joint of left elbow, initial encounter', true),
  ('S56.011A', 'Strain of flexor muscle/tendon of right thumb at forearm level, initial encounter', true),
  ('S56.811A', 'Strain of other muscles/tendons at forearm level, right arm, initial encounter', true),
  ('S56.812A', 'Strain of other muscles/tendons at forearm level, left arm, initial encounter', true),
  ('M25.521',  'Pain in right elbow', true),
  ('M25.522',  'Pain in left elbow', true),
  ('M77.11',   'Lateral epicondylitis, right elbow', true),
  ('M77.12',   'Lateral epicondylitis, left elbow', true),
  ('M77.01',   'Medial epicondylitis, right elbow', true),
  ('M77.02',   'Medial epicondylitis, left elbow', true),

  -- ==========================================================
  -- WRIST & HAND (L/R)
  -- ==========================================================
  ('S63.501A', 'Unspecified sprain of right wrist, initial encounter', true),
  ('S63.502A', 'Unspecified sprain of left wrist, initial encounter', true),
  ('S63.8X1A', 'Other specified sprain of right wrist and hand, initial encounter', true),
  ('S63.8X2A', 'Other specified sprain of left wrist and hand, initial encounter', true),
  ('S66.811A', 'Strain of other muscles/tendons at wrist/hand level, right hand, initial encounter', true),
  ('S66.812A', 'Strain of other muscles/tendons at wrist/hand level, left hand, initial encounter', true),
  ('M25.531',  'Pain in right wrist', true),
  ('M25.532',  'Pain in left wrist', true),
  ('G56.01',   'Carpal tunnel syndrome, right upper limb', true),
  ('G56.02',   'Carpal tunnel syndrome, left upper limb', true),

  -- ==========================================================
  -- CHEST / RIB / STERNUM
  -- ==========================================================
  ('S22.31XA', 'Fracture of one rib, right side, initial encounter for closed fracture', true),
  ('S22.32XA', 'Fracture of one rib, left side, initial encounter for closed fracture', true),
  ('S22.49XA', 'Multiple fractures of ribs, unspecified side, initial encounter for closed fracture', true),
  ('S23.41XA', 'Sprain of ribs, initial encounter', true),
  ('S23.42XA', 'Sprain of sternum, initial encounter', true),
  ('R07.81',   'Pleuritic pain', true),
  ('R07.82',   'Intercostal pain', true),
  ('R07.89',   'Other chest pain', true),
  ('R07.9',    'Chest pain, unspecified', true),

  -- ==========================================================
  -- HIP / PELVIS
  -- ==========================================================
  ('S73.101A', 'Unspecified sprain of right hip, initial encounter', true),
  ('S73.102A', 'Unspecified sprain of left hip, initial encounter', true),
  ('S76.011A', 'Strain of muscle/tendon of right hip, initial encounter', true),
  ('S76.012A', 'Strain of muscle/tendon of left hip, initial encounter', true),
  ('S76.811A', 'Strain of other specified muscles/tendons at hip/thigh level, right leg, initial encounter', true),
  ('S76.812A', 'Strain of other specified muscles/tendons at hip/thigh level, left leg, initial encounter', true),
  ('M25.551',  'Pain in right hip', true),
  ('M25.552',  'Pain in left hip', true),
  ('M76.61',   'Achilles tendinitis, right leg', true),
  ('M76.62',   'Achilles tendinitis, left leg', true),
  ('S33.6XXA', 'Sprain of sacroiliac joint, initial encounter', true),

  -- ==========================================================
  -- KNEE (L/R)
  -- ==========================================================
  ('S83.401A', 'Sprain of unspecified collateral ligament of right knee, initial encounter', true),
  ('S83.402A', 'Sprain of unspecified collateral ligament of left knee, initial encounter', true),
  ('S83.411A', 'Sprain of medial collateral ligament of right knee, initial encounter', true),
  ('S83.412A', 'Sprain of medial collateral ligament of left knee, initial encounter', true),
  ('S83.421A', 'Sprain of lateral collateral ligament of right knee, initial encounter', true),
  ('S83.422A', 'Sprain of lateral collateral ligament of left knee, initial encounter', true),
  ('S83.511A', 'Sprain of anterior cruciate ligament of right knee, initial encounter', true),
  ('S83.512A', 'Sprain of anterior cruciate ligament of left knee, initial encounter', true),
  ('S83.521A', 'Sprain of posterior cruciate ligament of right knee, initial encounter', true),
  ('S83.522A', 'Sprain of posterior cruciate ligament of left knee, initial encounter', true),
  ('S83.91XA', 'Sprain of unspecified site of right knee, initial encounter', true),
  ('S83.92XA', 'Sprain of unspecified site of left knee, initial encounter', true),
  ('S86.011A', 'Strain of right Achilles tendon, initial encounter', true),
  ('S86.012A', 'Strain of left Achilles tendon, initial encounter', true),
  ('S86.811A', 'Strain of other specified muscles/tendons at lower leg level, right leg, initial encounter', true),
  ('S86.812A', 'Strain of other specified muscles/tendons at lower leg level, left leg, initial encounter', true),
  ('M25.561',  'Pain in right knee', true),
  ('M25.562',  'Pain in left knee', true),
  ('M22.41',   'Chondromalacia patellae, right knee', true),
  ('M22.42',   'Chondromalacia patellae, left knee', true),
  ('M23.51',   'Chronic instability of right knee', true),
  ('M23.52',   'Chronic instability of left knee', true),

  -- ==========================================================
  -- ANKLE / FOOT (L/R)
  -- ==========================================================
  ('S93.401A', 'Sprain of unspecified ligament of right ankle, initial encounter', true),
  ('S93.402A', 'Sprain of unspecified ligament of left ankle, initial encounter', true),
  ('S93.411A', 'Sprain of calcaneofibular ligament of right ankle, initial encounter', true),
  ('S93.412A', 'Sprain of calcaneofibular ligament of left ankle, initial encounter', true),
  ('S93.421A', 'Sprain of deltoid ligament of right ankle, initial encounter', true),
  ('S93.422A', 'Sprain of deltoid ligament of left ankle, initial encounter', true),
  ('S93.431A', 'Sprain of tibiofibular ligament of right ankle, initial encounter', true),
  ('S93.432A', 'Sprain of tibiofibular ligament of left ankle, initial encounter', true),
  ('S93.491A', 'Sprain of other ligament of right ankle, initial encounter', true),
  ('S93.492A', 'Sprain of other ligament of left ankle, initial encounter', true),
  ('S96.811A', 'Strain of other specified muscles/tendons at ankle/foot level, right foot, initial encounter', true),
  ('S96.812A', 'Strain of other specified muscles/tendons at ankle/foot level, left foot, initial encounter', true),
  ('M25.571',  'Pain in right ankle and joints of right foot', true),
  ('M25.572',  'Pain in left ankle and joints of left foot', true),
  ('M79.671',  'Pain in right foot', true),
  ('M79.672',  'Pain in left foot', true),

  -- ==========================================================
  -- CONTUSIONS (bruising) — by body part
  -- ==========================================================
  ('S20.211A', 'Contusion of right front wall of thorax, initial encounter', true),
  ('S20.212A', 'Contusion of left front wall of thorax, initial encounter', true),
  ('S20.221A', 'Contusion of right back wall of thorax, initial encounter', true),
  ('S20.222A', 'Contusion of left back wall of thorax, initial encounter', true),
  ('S30.0XXA', 'Contusion of lower back and pelvis, initial encounter', true),
  ('S30.1XXA', 'Contusion of abdominal wall, initial encounter', true),
  ('S40.011A', 'Contusion of right shoulder, initial encounter', true),
  ('S40.012A', 'Contusion of left shoulder, initial encounter', true),
  ('S50.01XA', 'Contusion of right elbow, initial encounter', true),
  ('S50.02XA', 'Contusion of left elbow, initial encounter', true),
  ('S60.211A', 'Contusion of right wrist, initial encounter', true),
  ('S60.212A', 'Contusion of left wrist, initial encounter', true),
  ('S70.01XA', 'Contusion of right hip, initial encounter', true),
  ('S70.02XA', 'Contusion of left hip, initial encounter', true),
  ('S80.01XA', 'Contusion of right knee, initial encounter', true),
  ('S80.02XA', 'Contusion of left knee, initial encounter', true),
  ('S90.01XA', 'Contusion of right ankle, initial encounter', true),
  ('S90.02XA', 'Contusion of left ankle, initial encounter', true),

  -- ==========================================================
  -- MVA / EXTERNAL CAUSE CODES (used as secondary, not primary)
  -- ==========================================================
  ('V43.52XA', 'Car driver injured in collision with car in traffic accident, initial encounter', true),
  ('V43.62XA', 'Car passenger injured in collision with car in traffic accident, initial encounter', true),
  ('V47.52XA', 'Car driver injured in collision with fixed object in traffic accident, initial encounter', true),
  ('V48.52XA', 'Car driver injured in noncollision transport accident in traffic, initial encounter', true),
  ('V49.50XA', 'Driver of car injured in unspecified traffic accident, initial encounter', true),
  ('V89.2XXA', 'Person injured in unspecified motor-vehicle accident, traffic, initial encounter', true),
  ('Y92.410',  'Unspecified street and highway as the place of occurrence of the external cause', true),
  ('Y93.K1',   'Activity, walking an animal', true),
  ('Y99.8',    'Other external cause status', true),
  ('W18.30XA', 'Fall on same level, unspecified, initial encounter', true),
  ('W19.XXXA', 'Unspecified fall, initial encounter', true),
  ('W01.0XXA', 'Fall on same level from slipping, tripping and stumbling without subsequent striking against object, initial encounter', true),

  -- ==========================================================
  -- CHRONIC / GENERAL PAIN & MISC
  -- ==========================================================
  ('M79.1',    'Myalgia (muscle pain)', true),
  ('M79.7',    'Fibromyalgia', true),
  ('M79.601',  'Pain in right arm', true),
  ('M79.602',  'Pain in left arm', true),
  ('M79.604',  'Pain in right leg', true),
  ('M79.605',  'Pain in left leg', true),
  ('M79.609',  'Pain in unspecified limb', true),
  ('R52',      'Pain, unspecified', true),
  ('G89.11',   'Acute pain due to trauma', true),
  ('G89.21',   'Chronic pain due to trauma', true),
  ('G89.29',   'Other chronic pain', true),
  ('G89.4',    'Chronic pain syndrome', true),
  ('M62.830',  'Muscle spasm of back', true),
  ('M62.831',  'Muscle spasm of calf', true),
  ('M53.1',    'Cervicobrachial syndrome', true),
  ('M53.81',   'Other specified dorsopathies, occipito-atlanto-axial region', true),
  ('M53.82',   'Other specified dorsopathies, cervical region', true),
  ('M53.83',   'Other specified dorsopathies, cervicothoracic region', true),
  ('M53.84',   'Other specified dorsopathies, thoracic region', true),
  ('M53.85',   'Other specified dorsopathies, thoracolumbar region', true),
  ('M53.86',   'Other specified dorsopathies, lumbar region', true),
  ('M53.87',   'Other specified dorsopathies, lumbosacral region', true),
  ('M62.6',    'Muscle wasting and atrophy, not elsewhere classified', true),
  ('M62.81',   'Muscle weakness (generalized)', true),
  ('R26.2',    'Difficulty in walking, not elsewhere classified', true),
  ('R26.81',   'Unsteadiness on feet', true),
  ('R29.3',    'Abnormal posture', true)
on conflict (code) do nothing;

-- ==========================================================
-- Full-text search index on description for fast lookup
-- ==========================================================
create extension if not exists pg_trgm;
create index if not exists icd_codes_desc_trgm_idx on public.icd_codes using gin (description gin_trgm_ops);
create index if not exists icd_codes_code_idx on public.icd_codes (code);

notify pgrst, 'reload schema';
