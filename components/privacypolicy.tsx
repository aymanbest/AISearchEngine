import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Check } from "lucide-react"

export function PrivacyPolicy() {
    return (
        <Dialog>
                <DialogTrigger asChild>
                  <Button variant="link" className="text-muted-foreground hover:text-primary">
                    Privacy Policy
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-[900px] max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Privacy Policy</DialogTitle>
                    <DialogDescription>
                      Your privacy is our top priority. We&apos;ve built our search engine with privacy at its core.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Zero Data Collection</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          <li className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-primary" />
                            No search history stored
                          </li>
                          <li className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-primary" />
                            No IP addresses logged
                          </li>
                          <li className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-primary" />
                            No cookies or tracking
                          </li>
                          <li className="flex items-center">
                            <Check className="h-4 w-4 mr-2 text-primary" />
                            No user profiles created
                          </li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Local Storage Only</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Visual Preferences:</h4>
                          <p className="text-muted-foreground">Theme and layout settings for your comfort</p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">No Personal Data:</h4>
                          <p className="text-muted-foreground">We never store personal information or search patterns</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </DialogContent>
              </Dialog>
    )
}