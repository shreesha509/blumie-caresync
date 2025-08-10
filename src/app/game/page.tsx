import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function GamePage() {
  return (
    <div className="container mx-auto max-w-2xl py-10 animate-in fade-in">
      <div className="flex flex-col items-center text-center">
        <h1 className="text-4xl font-bold font-headline tracking-tight">Mindful Games</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          A space for reflection and self-discovery.
        </p>
      </div>

      <Card className="mt-10">
        <CardHeader>
          <CardTitle>Quick Question</CardTitle>
          <CardDescription>
            Take a moment to reflect on your habits.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="coping-mechanism" className="font-semibold">
                  When you feel stressed, what's your go-to coping mechanism?
                </Label>
                <RadioGroup defaultValue="none" id="coping-mechanism" className="pt-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="breathing" id="r1" />
                    <Label htmlFor="r1">Deep breathing or meditation</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="music" id="r2" />
                    <Label htmlFor="r2">Listening to music</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="talk" id="r3" />
                    <Label htmlFor="r3">Talking to a friend</Label>
                  </div>
                   <div className="flex items-center space-x-2">
                    <RadioGroupItem value="walk" id="r4" />
                    <Label htmlFor="r4">Going for a walk</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button className="w-full" disabled>Submit Answer (Placeholder)</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
