import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Check, Shield } from 'lucide-react';

export function Terms(){

    return (
        <Dialog>
                <DialogTrigger asChild>
                  <Button variant="link" className="text-muted-foreground hover:text-primary">
                    Terms of Service
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[900px] max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Terms of Service</DialogTitle>
                    <DialogDescription>
                      Our commitment to privacy-first, ad-free search with complete transparency.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Privacy Commitment</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          <li className="flex items-center">
                            <Shield className="h-4 w-4 mr-2 text-primary" />
                            No tracking or surveillance
                          </li>
                          <li className="flex items-center">
                            <Shield className="h-4 w-4 mr-2 text-primary" />
                            No personal data collection
                          </li>
                          <li className="flex items-center">
                            <Shield className="h-4 w-4 mr-2 text-primary" />
                            No advertising or profiling
                          </li>
                          <li className="flex items-center">
                            <Shield className="h-4 w-4 mr-2 text-primary" />
                            No third-party tracking
                          </li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Fair Usage</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          <li className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-primary" />
                            Legal and ethical use only
                          </li>
                          <li className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-primary" />
                            No automated scraping
                          </li>
                          <li className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-primary" />
                            Respect for intellectual property
                          </li>
                          <li className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-primary" />
                            No malicious activities
                          </li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="security">
                        <AccordionTrigger>Service Security</AccordionTrigger>
                        <AccordionContent>
                          <p className="text-muted-foreground">
                            We maintain a strict no-logs policy. Your searches are not recorded or stored anywhere.
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="availability">
                        <AccordionTrigger>Service Availability</AccordionTrigger>
                        <AccordionContent>
                          <p className="text-muted-foreground">
                            While we strive for 100% uptime, we don&apos;t guarantee uninterrupted service availability.
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                      <AccordionItem value="changes">
                        <AccordionTrigger>Updates to Terms</AccordionTrigger>
                        <AccordionContent>
                          <p className="text-muted-foreground">
                            We may update these terms from time to time. Significant changes will be announced on our homepage.
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </DialogContent>
              </Dialog>
    )
}