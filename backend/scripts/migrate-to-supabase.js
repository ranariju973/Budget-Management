/**
 * MongoDB to Supabase Migration Script
 * 
 * This script exports data from MongoDB and imports it into Supabase.
 * 
 * Prerequisites:
 * 1. npm install @supabase/supabase-js
 * 2. Set environment variables (see below)
 * 
 * Usage:
 * SUPABASE_URL=your_url SUPABASE_SERVICE_KEY=your_key node scripts/migrate-to-supabase.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { createClient } = require('@supabase/supabase-js');

// Import existing Mongoose models
const User = require('../models/User');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const BudgetGoal = require('../models/BudgetGoal');
const Borrow = require('../models/Borrow');
const Lend = require('../models/Lend');
const SplitGroup = require('../models/SplitGroup');
const SplitExpense = require('../models/SplitExpense');

// Supabase client with service role key (bypasses RLS)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Map to store MongoDB ObjectId -> Supabase UUID
const userIdMap = new Map();
const groupIdMap = new Map();

async function connectMongoDB() {
  console.log('🔗 Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ MongoDB connected');
}

async function migrateUsers() {
  console.log('\n📦 Migrating users...');
  const users = await User.find({}).select('+password').lean();
  
  for (const user of users) {
    const { data, error } = await supabase
      .from('users')
      .insert({
        mongo_id: user._id.toString(),
        name: user.name,
        email: user.email,
        password: user.password || null,
        google_id: user.googleId || null,
        push_subscriptions: user.pushSubscriptions || [],
        created_at: user.createdAt,
      })
      .select()
      .single();

    if (error) {
      console.error(`❌ Failed to migrate user ${user.email}:`, error.message);
      continue;
    }

    userIdMap.set(user._id.toString(), data.id);
    console.log(`  ✓ Migrated user: ${user.email}`);
  }
  
  console.log(`✅ Migrated ${userIdMap.size}/${users.length} users`);
}

async function migrateExpenses() {
  console.log('\n📦 Migrating expenses...');
  const expenses = await Expense.find({}).lean();
  let migrated = 0;
  
  for (const expense of expenses) {
    const userId = userIdMap.get(expense.userId.toString());
    if (!userId) {
      console.error(`  ⚠️ User not found for expense: ${expense._id}`);
      continue;
    }

    const { error } = await supabase.from('expenses').insert({
      mongo_id: expense._id.toString(),
      user_id: userId,
      title: expense.title,
      amount: expense.amount,
      date: expense.date,
      created_at: expense.createdAt,
      updated_at: expense.updatedAt,
    });

    if (error) {
      console.error(`  ❌ Failed to migrate expense ${expense._id}:`, error.message);
      continue;
    }
    migrated++;
  }
  
  console.log(`✅ Migrated ${migrated}/${expenses.length} expenses`);
}

async function migrateIncomes() {
  console.log('\n📦 Migrating incomes...');
  const incomes = await Income.find({}).lean();
  let migrated = 0;
  
  for (const income of incomes) {
    const userId = userIdMap.get(income.userId.toString());
    if (!userId) continue;

    const { error } = await supabase.from('incomes').insert({
      mongo_id: income._id.toString(),
      user_id: userId,
      amount: income.amount,
      month: income.month,
      year: income.year,
      created_at: income.createdAt,
      updated_at: income.updatedAt,
    });

    if (!error) migrated++;
  }
  
  console.log(`✅ Migrated ${migrated}/${incomes.length} incomes`);
}

async function migrateBudgetGoals() {
  console.log('\n📦 Migrating budget goals...');
  const goals = await BudgetGoal.find({}).lean();
  let migrated = 0;
  
  for (const goal of goals) {
    const userId = userIdMap.get(goal.userId.toString());
    if (!userId) continue;

    const { error } = await supabase.from('budget_goals').insert({
      mongo_id: goal._id.toString(),
      user_id: userId,
      category: goal.category,
      limit: goal.limit,
      month: goal.month,
      year: goal.year,
      created_at: goal.createdAt,
      updated_at: goal.updatedAt,
    });

    if (!error) migrated++;
  }
  
  console.log(`✅ Migrated ${migrated}/${goals.length} budget goals`);
}

async function migrateBorrows() {
  console.log('\n📦 Migrating borrows...');
  const borrows = await Borrow.find({}).lean();
  let migrated = 0;
  
  for (const borrow of borrows) {
    const userId = userIdMap.get(borrow.userId.toString());
    if (!userId) continue;

    const { error } = await supabase.from('borrows').insert({
      mongo_id: borrow._id.toString(),
      user_id: userId,
      person_name: borrow.personName,
      amount: borrow.amount,
      date: borrow.date,
      reason: borrow.reason || '',
      is_paid: borrow.isPaid,
      paid_date: borrow.paidDate,
      created_at: borrow.createdAt,
      updated_at: borrow.updatedAt,
    });

    if (!error) migrated++;
  }
  
  console.log(`✅ Migrated ${migrated}/${borrows.length} borrows`);
}

async function migrateLends() {
  console.log('\n📦 Migrating lends...');
  const lends = await Lend.find({}).lean();
  let migrated = 0;
  
  for (const lend of lends) {
    const userId = userIdMap.get(lend.userId.toString());
    if (!userId) continue;

    const { error } = await supabase.from('lends').insert({
      mongo_id: lend._id.toString(),
      user_id: userId,
      person_name: lend.personName,
      amount: lend.amount,
      date: lend.date,
      reason: lend.reason || '',
      is_paid: lend.isPaid,
      paid_date: lend.paidDate,
      created_at: lend.createdAt,
      updated_at: lend.updatedAt,
    });

    if (!error) migrated++;
  }
  
  console.log(`✅ Migrated ${migrated}/${lends.length} lends`);
}

async function migrateSplitGroups() {
  console.log('\n📦 Migrating split groups...');
  const groups = await SplitGroup.find({}).lean();
  let migrated = 0;
  
  for (const group of groups) {
    const createdBy = userIdMap.get(group.createdBy.toString());
    if (!createdBy) continue;

    const { data, error } = await supabase
      .from('split_groups')
      .insert({
        mongo_id: group._id.toString(),
        name: group.name,
        created_by: createdBy,
        invite_token: group.inviteToken,
        invite_token_expires_at: group.inviteTokenExpiresAt,
        is_settled: group.isSettled,
        settled_at: group.settledAt,
        created_at: group.createdAt,
        updated_at: group.updatedAt,
      })
      .select()
      .single();

    if (error) {
      console.error(`  ❌ Failed to migrate group ${group.name}:`, error.message);
      continue;
    }

    groupIdMap.set(group._id.toString(), data.id);
    
    // Migrate group members
    for (const member of group.members || []) {
      const memberId = userIdMap.get(member.userId.toString());
      if (!memberId) continue;

      await supabase.from('split_group_members').insert({
        group_id: data.id,
        user_id: memberId,
        name: member.name,
        email: member.email,
        role: member.role,
        joined_at: member.joinedAt,
      });
    }
    
    migrated++;
  }
  
  console.log(`✅ Migrated ${migrated}/${groups.length} split groups`);
}

async function migrateSplitExpenses() {
  console.log('\n📦 Migrating split expenses...');
  const expenses = await SplitExpense.find({}).lean();
  let migrated = 0;
  
  for (const expense of expenses) {
    const groupId = groupIdMap.get(expense.groupId.toString());
    const paidBy = userIdMap.get(expense.paidBy.toString());
    const addedBy = userIdMap.get(expense.addedBy.toString());
    
    if (!groupId || !paidBy || !addedBy) continue;

    const { error } = await supabase.from('split_expenses').insert({
      mongo_id: expense._id.toString(),
      group_id: groupId,
      title: expense.title,
      amount: expense.amount,
      paid_by: paidBy,
      date: expense.date,
      added_by: addedBy,
      created_at: expense.createdAt,
      updated_at: expense.updatedAt,
    });

    if (!error) migrated++;
  }
  
  console.log(`✅ Migrated ${migrated}/${expenses.length} split expenses`);
}

async function main() {
  console.log('🚀 Starting MongoDB to Supabase Migration\n');
  console.log('═'.repeat(50));
  
  try {
    await connectMongoDB();
    
    // Migrate in order (users first, then dependent tables)
    await migrateUsers();
    await migrateExpenses();
    await migrateIncomes();
    await migrateBudgetGoals();
    await migrateBorrows();
    await migrateLends();
    await migrateSplitGroups();
    await migrateSplitExpenses();
    
    console.log('\n' + '═'.repeat(50));
    console.log('🎉 Migration completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Users migrated: ${userIdMap.size}`);
    console.log(`   Groups migrated: ${groupIdMap.size}`);
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB disconnected');
  }
}

main();
