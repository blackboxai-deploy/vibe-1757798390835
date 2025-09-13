"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface EmailSystemProps {
  onBack: () => void;
  playerName: string;
}

interface Email {
  id: string;
  from: string;
  subject: string;
  content: string;
  timestamp: Date;
  read: boolean;
  type: "contract" | "threat" | "opportunity" | "news";
  reward?: number;
  actionLink?: string;
}

interface Contact {
  id: string;
  name: string;
  role: string;
  relationship: "ally" | "neutral" | "enemy";
  avatar: string;
}

export default function EmailSystem({ onBack, playerName }: EmailSystemProps) {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [contacts] = useState<Contact[]>([
    {
      id: "vinny",
      name: "Vinny 'The Shark' Romano",
      role: "Business Partner",
      relationship: "ally",
      avatar: "🦈"
    },
    {
      id: "sofia",
      name: "Sofia Martinez",
      role: "Information Broker",
      relationship: "neutral",
      avatar: "🕵️"
    },
    {
      id: "dmitri",
      name: "Dmitri Volkov",
      role: "Rival Gang Leader",
      relationship: "enemy",
      avatar: "⚡"
    },
    {
      id: "chief",
      name: "Chief of Police",
      role: "Law Enforcement",
      relationship: "enemy",
      avatar: "👮"
    },
    {
      id: "banker",
      name: "Marcus Wellington",
      role: "Private Banker",
      relationship: "neutral",
      avatar: "💼"
    }
  ]);

  useEffect(() => {
    generateInitialEmails();
  }, [playerName, generateInitialEmails]);

  const generateInitialEmails = useCallback(() => {
    const initialEmails: Email[] = [
      {
        id: "welcome",
        from: "Justin Devon Mitchell",
        subject: "Welcome to Street Empire: Business Wars - Action Pack Edition",
        content: `Welcome to the streets, ${playerName}.

You've just entered the most dangerous business district in the city. Here, money talks and bullets settle debates. I've prepared this special Action Pack edition just for you.

Your mission is simple: Build your criminal empire from the ground up. Take over territories, eliminate competition, and become the ultimate street kingpin.

Key Features Available:
• Advanced 2D combat system with multiple weapon types
• Custom avatar creation from your photos  
• Integrated beatmaker with autotune capabilities
• Dynamic mission system with business-focused objectives
• Territory control and economic warfare

Remember: In this business, loyalty is rare and trust is expensive. Watch your back, make smart moves, and never show weakness.

The streets are waiting. Make them yours.

Stay dangerous,
Justin Devon Mitchell
Creator - Street Empire Action Pack

P.S. - Check your other emails for immediate contract opportunities.

---
🔗 Visit: ${typeof window !== 'undefined' ? window.location.origin : 'localhost:3000'}/action-pack
For exclusive Action Pack content and updates.`,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        read: false,
        type: "news"
      },
      {
        id: "contract1",
        from: "Vinny 'The Shark' Romano",
        subject: "🎯 High-Priority Contract: Warehouse Cleanup",
        content: `${playerName},

Got a situation that needs your particular set of skills. The Kozlov crew has been moving product through OUR warehouse on the east side. This is unacceptable.

Job Details:
- Location: East Side Industrial Complex
- Target: 5-8 Kozlov soldiers
- Objective: Clear them out permanently
- Time Limit: 48 hours

Payment: $15,000 cash + 20% of recovered merchandise

This is a test of your capabilities. Prove yourself here, and bigger opportunities will follow. Fail, and you'll be swimming with the fishes.

Clean and quiet preferred, but loud works too. Your choice.

Don't disappoint me.

- Vinny

P.S. - Watch out for Dmitri's lieutenant, "Razor" Petrov. He's fast with a blade.`,
        timestamp: new Date(Date.now() - 1000 * 60 * 90), // 1.5 hours ago
        read: false,
        type: "contract",
        reward: 15000,
        actionLink: `${typeof window !== 'undefined' ? window.location.origin : 'localhost:3000'}/game/mission/warehouse-cleanup`
      },
      {
        id: "intel1",
        from: "Sofia Martinez",
        subject: "📊 Intelligence Report: Market Opportunities",
        content: `${playerName},

My sources have uncovered some interesting developments in the local business landscape:

OPPORTUNITIES:
• The Diamond District is experiencing a power vacuum after the recent "incident"
• Port Authority contracts are up for grabs - insider says bidding is rigged
• New money laundering operation needs experienced partners
• Underground fight club looking for backers with muscle

THREATS:
• FBI task force increased surveillance in financial district
• Dmitri's crew is recruiting heavily - planning something big
• Police Chief got a budget increase - more heat coming our way

MARKET INTEL:
• Weapon prices up 15% due to supply chain "disruptions"
• Real estate values in contested territories dropped 30%
• Crypto payments now preferred for offshore transactions

This information is worth $5,000. Pay up, and I'll keep you in the loop.

Stay informed or stay dead.

- Sofia
Information is power. Power is money.

Wire transfer details attached.`,
        timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
        read: false,
        type: "opportunity",
        reward: 5000
      },
      {
        id: "threat1",
        from: "Dmitri Volkov",
        subject: "⚠️ WARNING: Stay Out of My Territory",
        content: `${playerName},

I hear you've been asking questions about my operations. This is your only warning.

The east side belongs to the Volkov family. Always has, always will. Your little friendship with that fish Vinny doesn't protect you here.

Cross into my territory, and you'll learn why they call me "The Hammer." I've buried bigger fish than you in shallow graves.

Stick to your side of town, and we won't have problems.

But if you're feeling brave... I'll be waiting.

- Dmitri Volkov
Leader, Volkov Syndicate

"In Russia, we have saying: Dead dogs don't bark."`,
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        read: false,
        type: "threat"
      },
      {
        id: "banking1",
        from: "Marcus Wellington",
        subject: "💰 Exclusive Banking Services - Discretion Guaranteed",
        content: `Dear Mr. ${playerName},

Wellington Private Banking extends an exclusive invitation to our premium discretionary services.

We understand that entrepreneurs in your... industry... require banking solutions that prioritize privacy and flexibility.

Our Services Include:
• Offshore account management
• Cryptocurrency conversion and storage  
• Asset protection and estate planning
• International wire transfers (no questions asked)
• Cash structuring and reporting compliance

Minimum account balance: $100,000
Monthly service fee: 2.5% of managed assets
Setup fee: $25,000 (one-time)

We have served distinguished clients in your field for over 30 years. References available upon request from satisfied customers who are still breathing.

Discretion is our middle name. Success is our business.

Contact us when you're ready to play in the big leagues.

Respectfully yours,
Marcus Wellington
Senior Private Banker
Wellington & Associates

"Where your money works as hard as you do."`,
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
        read: false,
        type: "opportunity",
        reward: 100000
      }
    ];

    setEmails(initialEmails);
  }, [playerName]);

  const markAsRead = (email: Email) => {
    setEmails(prev => prev.map(e => 
      e.id === email.id ? { ...e, read: true } : e
    ));
    setSelectedEmail({ ...email, read: true });
  };

  const deleteEmail = (emailId: string) => {
    setEmails(prev => prev.filter(e => e.id !== emailId));
    if (selectedEmail?.id === emailId) {
      setSelectedEmail(null);
    }
  };

  const getEmailIcon = (type: string) => {
    switch (type) {
      case "contract": return "🎯";
      case "threat": return "⚠️";
      case "opportunity": return "💰";
      case "news": return "📰";
      default: return "📧";
    }
  };

  const getContactAvatar = (fromName: string) => {
    const contact = contacts.find(c => fromName.includes(c.name));
    return contact?.avatar || "👤";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-red-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-orbitron font-bold text-white">
            Business Email System
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-white">
              <span className="text-yellow-400">User:</span> {playerName}
            </div>
            <Button onClick={onBack} variant="outline">
              ← Back to Menu
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Email List */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800/50 border-gray-600">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  Inbox ({emails.filter(e => !e.read).length} unread)
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={generateInitialEmails}
                  >
                    Refresh
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {emails.map((email) => (
                    <div
                      key={email.id}
                      onClick={() => {
                        setSelectedEmail(email);
                        if (!email.read) markAsRead(email);
                      }}
                      className={`p-3 rounded-lg border cursor-pointer transition-all hover:border-gray-400 ${
                        !email.read 
                          ? 'bg-blue-900/30 border-blue-500' 
                          : 'bg-gray-700/30 border-gray-600'
                      } ${
                        selectedEmail?.id === email.id ? 'ring-2 ring-yellow-400' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getContactAvatar(email.from)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{getEmailIcon(email.type)}</span>
                              {!email.read && (
                                <Badge variant="destructive" className="text-xs">New</Badge>
                              )}
                            </div>
                            <div className="text-white text-sm font-medium truncate">
                              {email.from}
                            </div>
                            <div className="text-gray-300 text-xs truncate">
                              {email.subject}
                            </div>
                            <div className="text-gray-400 text-xs">
                              {email.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                        {email.reward && (
                          <Badge className="bg-green-600 text-white text-xs">
                            ${email.reward.toLocaleString()}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Contacts */}
            <Card className="bg-gray-800/50 border-gray-600 mt-6">
              <CardHeader>
                <CardTitle className="text-white">Key Contacts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-700/30">
                      <span className="text-2xl">{contact.avatar}</span>
                      <div className="flex-1">
                        <div className="text-white text-sm font-medium">{contact.name}</div>
                        <div className="text-gray-400 text-xs">{contact.role}</div>
                      </div>
                      <Badge 
                        className={
                          contact.relationship === "ally" ? "bg-green-600" :
                          contact.relationship === "enemy" ? "bg-red-600" : "bg-yellow-600"
                        }
                      >
                        {contact.relationship}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Email Content */}
          <div className="lg:col-span-2">
            {selectedEmail ? (
              <Card className="bg-gray-800/50 border-gray-600">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        <span className="text-2xl">{getContactAvatar(selectedEmail.from)}</span>
                        {selectedEmail.subject}
                      </CardTitle>
                      <div className="text-gray-400 text-sm mt-2">
                        From: {selectedEmail.from}
                      </div>
                      <div className="text-gray-400 text-sm">
                        Time: {selectedEmail.timestamp.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={
                        selectedEmail.type === "contract" ? "bg-blue-600" :
                        selectedEmail.type === "threat" ? "bg-red-600" :
                        selectedEmail.type === "opportunity" ? "bg-green-600" : "bg-gray-600"
                      }>
                        {selectedEmail.type.toUpperCase()}
                      </Badge>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteEmail(selectedEmail.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-black/30 p-4 rounded-lg border border-gray-600">
                    <pre className="text-gray-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                      {selectedEmail.content}
                    </pre>
                  </div>
                  
                  {selectedEmail.actionLink && (
                    <div className="mt-4 p-4 bg-green-900/20 border border-green-600 rounded-lg">
                      <div className="text-green-400 text-sm font-medium mb-2">
                        Action Required
                      </div>
                      <Button className="bg-green-600 hover:bg-green-700">
                        Accept Contract
                      </Button>
                    </div>
                  )}
                  
                  {selectedEmail.reward && selectedEmail.type === "opportunity" && (
                    <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-600 rounded-lg">
                      <div className="text-yellow-400 text-sm font-medium mb-2">
                        Potential Reward: ${selectedEmail.reward.toLocaleString()}
                      </div>
                      <Button className="bg-yellow-600 hover:bg-yellow-700">
                        Pursue Opportunity
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gray-800/50 border-gray-600 h-full">
                <CardContent className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-400">
                    <div className="text-6xl mb-4">📧</div>
                    <div className="text-xl mb-2">Select an email to view</div>
                    <div className="text-sm">
                      Click on any email from your inbox to read its contents
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}