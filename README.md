# Body Perception Assessment

An educational web application designed to help people understand their personal biases when assessing body weight and size.

## About This Project

### Purpose

This interactive assessment reveals how individuals perceive body weight by presenting 12 different body images for binary classification ("fat" or "not fat"). The primary goal is to make people aware of their own tendencies and biases when evaluating others' bodies, highlighting that such perceptions are inherently subjective and relative rather than objective facts.

### The Problem We're Addressing

In today's society, we often find ourselves caught between two problematic extremes when it comes to body image discussions:

**One extreme** promotes the idea that concepts like "overweight" or body size concerns don't exist at all, dismissing legitimate health considerations and the reality that people do have different body compositions. This perspective, while well-intentioned in fighting stigma, can sometimes ignore important health nuances.

**The other extreme** glorifies unrealistic and often unhealthy body standards, promoting body types that are either unattainable for most people or achieved through unhealthy means. This perspective contributes to body dysmorphia, eating disorders, and widespread dissatisfaction with normal, healthy bodies.

### Our Approach

This project aims to find a thoughtful middle ground by:

- **Promoting self-awareness**: Helping users recognize their own perceptual biases
- **Highlighting subjectivity**: Demonstrating that body size perception varies significantly between individuals
- **Providing context**: Showing users how their perceptions compare to others through percentile rankings
- **Encouraging reflection**: Creating a moment for users to consider why they classify bodies the way they do

### How It Works

Users are shown 12 body images in random order and must classify each as "fat" or "not fat." Their responses are then compared against all previous users, revealing:

- Their personal scoring pattern
- How their perceptions align with or differ from the collective average
- Their percentile ranking relative to other users

This comparison isn't meant to judge users as "right" or "wrong," but rather to illustrate the wide spectrum of human perception and encourage more thoughtful, less automatic judgments about bodies.

### Educational Value

By participating in this assessment, users often discover:

- Their perceptions may be more or less critical than they realized
- There's significant variation in how different people perceive the same bodies
- Cultural and personal biases influence these snap judgments
- The importance of approaching body-related discussions with more nuance and empathy

### A Note on Sensitivity

We understand this is a sensitive topic that affects people deeply. This tool is designed for educational reflection, not to shame or categorize people. The goal is to foster more thoughtful, less reactive approaches to how we think about and discuss bodies - both others' and our own.

---

## Technical Details

Built with vanilla JavaScript and deployed on Cloudflare Pages with Workers for data collection and analysis.

### Quick Start

```bash
npm install
npm run dev
```

### Deployment

```bash
npm run deploy
```

For detailed technical setup, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Privacy

- No personal information collected
- Only assessment responses stored anonymously
- Data used solely for percentile calculations